from math import ceil
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models.staff import Staff
from staff_schemas import (
    StaffCreate,
    StaffUpdate,
    StaffResponse,
    StaffListResponse,
)

# Update these imports if your project uses a different
# authentication module or dependency name.
from auth.dependencies import get_current_user


router = APIRouter(
    prefix="/staff",
    tags=["Staff Management"],
)


# ============================================================
# AUTHORIZATION
# ============================================================

def require_staff_manager(current_user=Depends(get_current_user)):
    """
    Only school owners and administrators can manage staff.
    """

    role = getattr(current_user, "role", None)

    if hasattr(role, "value"):
        role = role.value

    if str(role).upper() not in {"OWNER", "ADMIN"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only school owners and administrators can manage staff.",
        )

    return current_user


# ============================================================
# GENERATE STAFF ID
# ============================================================

def generate_staff_id(db: Session) -> str:
    """
    Generates IDs such as STAFF-000001.
    """

    latest_staff = (
        db.query(Staff)
        .order_by(Staff.id.desc())
        .first()
    )

    next_number = 1 if latest_staff is None else latest_staff.id + 1

    staff_id = f"STAFF-{next_number:06d}"

    while db.query(Staff).filter(Staff.staff_id == staff_id).first():
        next_number += 1
        staff_id = f"STAFF-{next_number:06d}"

    return staff_id


# ============================================================
# CREATE STAFF
# POST /staff
# ============================================================

@router.post(
    "",
    response_model=StaffResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_staff(
    payload: StaffCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_manager),
):
    if payload.email:
        existing_email = (
            db.query(Staff)
            .filter(
                Staff.email == str(payload.email),
                Staff.is_deleted.is_(False),
            )
            .first()
        )

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A staff member with this email already exists.",
            )

    staff_id = payload.staff_id or generate_staff_id(db)

    existing_id = (
        db.query(Staff)
        .filter(Staff.staff_id == staff_id)
        .first()
    )

    if existing_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This staff ID already exists.",
        )

    staff_data = payload.model_dump(exclude={"staff_id"})

    staff = Staff(
        **staff_data,
        staff_id=staff_id,
    )

    db.add(staff)

    try:
        db.commit()
        db.refresh(staff)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create the staff record.",
        )

    return staff


# ============================================================
# LIST / SEARCH STAFF
# GET /staff
# ============================================================

@router.get(
    "",
    response_model=StaffListResponse,
)
def list_staff(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None, max_length=100),
    department: Optional[str] = Query(None, max_length=100),
    designation: Optional[str] = Query(None, max_length=100),
    staff_status: Optional[str] = Query(
        None,
        alias="status",
        max_length=30,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_manager),
):
    query = db.query(Staff).filter(
        Staff.is_deleted.is_(False)
    )

    if search:
        search_term = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Staff.staff_id.ilike(search_term),
                Staff.first_name.ilike(search_term),
                Staff.last_name.ilike(search_term),
                Staff.email.ilike(search_term),
                Staff.phone.ilike(search_term),
                Staff.department.ilike(search_term),
                Staff.designation.ilike(search_term),
            )
        )

    if department:
        query = query.filter(
            Staff.department.ilike(department.strip())
        )

    if designation:
        query = query.filter(
            Staff.designation.ilike(designation.strip())
        )

    if staff_status:
        query = query.filter(
            Staff.status.ilike(staff_status.strip())
        )

    total = query.count()

    items = (
        query.order_by(Staff.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": ceil(total / page_size) if total else 0,
    }


# ============================================================
# STAFF SUMMARY
# GET /staff/summary
# ============================================================

@router.get("/summary")
def staff_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_manager),
):
    staff_records = (
        db.query(Staff)
        .filter(Staff.is_deleted.is_(False))
        .all()
    )

    active = sum(
        1 for person in staff_records
        if (person.status or "").upper() == "ACTIVE"
    )

    inactive = sum(
        1 for person in staff_records
        if (person.status or "").upper() == "INACTIVE"
    )

    departments = {
        person.department
        for person in staff_records
        if person.department
    }

    return {
        "total_staff": len(staff_records),
        "active_staff": active,
        "inactive_staff": inactive,
        "other_status_staff": len(staff_records) - active - inactive,
        "total_departments": len(departments),
    }


# ============================================================
# GET STAFF BY DATABASE ID
# GET /staff/{staff_id}
# ============================================================

@router.get(
    "/{staff_id}",
    response_model=StaffResponse,
)
def get_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_manager),
):
    staff = (
        db.query(Staff)
        .filter(
            Staff.id == staff_id,
            Staff.is_deleted.is_(False),
        )
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found.",
        )

    return staff


# ============================================================
# UPDATE STAFF
# PUT /staff/{staff_id}
# ============================================================

@router.put(
    "/{staff_id}",
    response_model=StaffResponse,
)
def update_staff(
    staff_id: int,
    payload: StaffUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_manager),
):
    staff = (
        db.query(Staff)
        .filter(
            Staff.id == staff_id,
            Staff.is_deleted.is_(False),
        )
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found.",
        )

    update_data = payload.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"]:
        email_value = str(update_data["email"])

        existing_email = (
            db.query(Staff)
            .filter(
                Staff.email == email_value,
                Staff.id != staff_id,
                Staff.is_deleted.is_(False),
            )
            .first()
        )

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Another staff member already uses this email.",
            )

        update_data["email"] = email_value

    for field, value in update_data.items():
        setattr(staff, field, value)

    try:
        db.commit()
        db.refresh(staff)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update the staff record.",
        )

    return staff


# ============================================================
# SOFT DELETE STAFF
# DELETE /staff/{staff_id}
# ============================================================

@router.delete("/{staff_id}")
def delete_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff_manager),
):
    staff = (
        db.query(Staff)
        .filter(
            Staff.id == staff_id,
            Staff.is_deleted.is_(False),
        )
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found.",
        )

    staff.is_deleted = True

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete the staff record.",
        )

    return {
        "message": "Staff member archived successfully.",
        "staff_id": staff.staff_id,
    }