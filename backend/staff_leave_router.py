from datetime import date, datetime
from decimal import Decimal
from math import ceil
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models.staff import Staff
from models.staff_leave import StaffLeave

from staff_leave_schemas import (
    StaffLeaveCreate,
    StaffLeaveUpdate,
    StaffLeaveResponse,
    StaffLeaveListResponse,
    StaffLeaveListItem,
    StaffLeaveSummary,
)

from auth.dependencies import get_current_user


router = APIRouter(
    prefix="/staff-leaves",
    tags=["Staff Leave Management"],
)


# =====================================================
# ACCESS CONTROL
# =====================================================

def require_staff_leave_manager(
    current_user=Depends(get_current_user),
):
    role = getattr(
        current_user,
        "role",
        None,
    )

    if hasattr(role, "value"):
        role = role.value

    if str(role).upper() not in {
        "OWNER",
        "ADMIN",
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only school owners and "
                "administrators can manage staff leaves."
            ),
        )

    return current_user


# =====================================================
# CALCULATE LEAVE DAYS
# =====================================================

def calculate_leave_days(
    start_date: date,
    end_date: date,
) -> Decimal:

    if end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "End date cannot be earlier "
                "than start date."
            ),
        )

    days = (
        end_date - start_date
    ).days + 1

    return Decimal(days)


# =====================================================
# CREATE LEAVE REQUEST
# =====================================================

@router.post(
    "",
    response_model=StaffLeaveResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_staff_leave(
    payload: StaffLeaveCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_staff_leave_manager
    ),
):

    # ---------------------------------------------
    # Validate staff
    # ---------------------------------------------

    staff = (
        db.query(Staff)
        .filter(
            Staff.id == payload.staff_id,
            Staff.is_deleted.is_(False),
        )
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found.",
        )

    if str(staff.status).upper() != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Leave cannot be created for "
                "an inactive staff member."
            ),
        )

    # ---------------------------------------------
    # Validate dates
    # ---------------------------------------------

    total_days = calculate_leave_days(
        payload.start_date,
        payload.end_date,
    )

    # ---------------------------------------------
    # Check overlapping leave
    # ---------------------------------------------

    overlapping_leave = (
        db.query(StaffLeave)
        .filter(
            StaffLeave.staff_id
            == payload.staff_id,

            StaffLeave.status.in_(
                [
                    "PENDING",
                    "APPROVED",
                ]
            ),

            StaffLeave.start_date
            <= payload.end_date,

            StaffLeave.end_date
            >= payload.start_date,
        )
        .first()
    )

    if overlapping_leave:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This staff member already has "
                "a pending or approved leave "
                "overlapping these dates."
            ),
        )

    # ---------------------------------------------
    # Create leave
    # ---------------------------------------------

    leave = StaffLeave(
        staff_id=payload.staff_id,
        leave_type=payload.leave_type.upper(),
        start_date=payload.start_date,
        end_date=payload.end_date,
        total_days=total_days,
        reason=payload.reason,
        status="PENDING",
    )

    db.add(leave)

    try:

        db.commit()

        db.refresh(leave)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not create staff leave request."
            ),
        )

    return leave


# =====================================================
# LIST LEAVE REQUESTS
# =====================================================

@router.get(
    "",
    response_model=StaffLeaveListResponse,
)
def list_staff_leaves(
    page: int = Query(
        1,
        ge=1,
    ),

    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),

    status_filter: Optional[str] = Query(
        None,
        alias="status",
        max_length=30,
    ),

    leave_type: Optional[str] = Query(
        None,
        max_length=50,
    ),

    staff_id: Optional[int] = Query(
        None,
        gt=0,
    ),

    search: Optional[str] = Query(
        None,
        max_length=100,
    ),

    department: Optional[str] = Query(
        None,
        max_length=100,
    ),

    start_date: Optional[date] = Query(
        None,
    ),

    end_date: Optional[date] = Query(
        None,
    ),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_staff_leave_manager
    ),
):

    query = (
        db.query(
            StaffLeave,
            Staff,
        )
        .join(
            Staff,
            Staff.id
            == StaffLeave.staff_id,
        )
        .filter(
            Staff.is_deleted.is_(False),
        )
    )

    # ---------------------------------------------
    # Filters
    # ---------------------------------------------

    if status_filter:

        query = query.filter(
            StaffLeave.status.ilike(
                status_filter.strip()
            )
        )

    if leave_type:

        query = query.filter(
            StaffLeave.leave_type.ilike(
                leave_type.strip()
            )
        )

    if staff_id:

        query = query.filter(
            StaffLeave.staff_id
            == staff_id
        )

    if department:

        query = query.filter(
            Staff.department.ilike(
                department.strip()
            )
        )

    if start_date:

        query = query.filter(
            StaffLeave.start_date
            >= start_date
        )

    if end_date:

        query = query.filter(
            StaffLeave.end_date
            <= end_date
        )

    # ---------------------------------------------
    # Search
    # ---------------------------------------------

    if search:

        search_term = (
            f"%{search.strip()}%"
        )

        query = query.filter(
            or_(
                Staff.staff_id.ilike(
                    search_term
                ),

                Staff.first_name.ilike(
                    search_term
                ),

                Staff.last_name.ilike(
                    search_term
                ),

                Staff.email.ilike(
                    search_term
                ),

                Staff.department.ilike(
                    search_term
                ),

                Staff.designation.ilike(
                    search_term
                ),

                StaffLeave.leave_type.ilike(
                    search_term
                ),

                StaffLeave.reason.ilike(
                    search_term
                ),
            )
        )

    # ---------------------------------------------
    # Count
    # ---------------------------------------------

    total = query.count()

    # ---------------------------------------------
    # Pagination
    # ---------------------------------------------

    records = (
        query
        .order_by(
            StaffLeave.start_date.desc(),
            StaffLeave.id.desc(),
        )
        .offset(
            (page - 1) * page_size
        )
        .limit(page_size)
        .all()
    )

    # ---------------------------------------------
    # Response items
    # ---------------------------------------------

    items = []

    for leave, staff in records:

        items.append(
            StaffLeaveListItem(
                id=leave.id,

                staff_id=leave.staff_id,

                leave_type=leave.leave_type,

                start_date=leave.start_date,

                end_date=leave.end_date,

                total_days=leave.total_days,

                reason=leave.reason,

                status=leave.status,

                approval_remarks=(
                    leave.approval_remarks
                ),

                approved_by=leave.approved_by,

                approved_at=leave.approved_at,

                created_at=leave.created_at,

                updated_at=leave.updated_at,

                staff_code=staff.staff_id,

                staff_name=(
                    f"{staff.first_name} "
                    f"{staff.last_name}"
                ).strip(),

                department=staff.department,

                designation=staff.designation,
            )
        )

    return {
        "items": items,

        "total": total,

        "page": page,

        "page_size": page_size,

        "pages": (
            ceil(total / page_size)
            if total
            else 0
        ),
    }


# =====================================================
# LEAVE SUMMARY
# =====================================================

@router.get(
    "/summary",
    response_model=StaffLeaveSummary,
)
def staff_leave_summary(
    db: Session = Depends(get_db),

    current_user=Depends(
        require_staff_leave_manager
    ),
):

    total_requests = (
        db.query(StaffLeave)
        .join(
            Staff,
            Staff.id
            == StaffLeave.staff_id,
        )
        .filter(
            Staff.is_deleted.is_(False),
        )
        .count()
    )

    pending = (
        db.query(StaffLeave)
        .join(
            Staff,
            Staff.id
            == StaffLeave.staff_id,
        )
        .filter(
            Staff.is_deleted.is_(False),
            StaffLeave.status
            == "PENDING",
        )
        .count()
    )

    approved = (
        db.query(StaffLeave)
        .join(
            Staff,
            Staff.id
            == StaffLeave.staff_id,
        )
        .filter(
            Staff.is_deleted.is_(False),
            StaffLeave.status
            == "APPROVED",
        )
        .count()
    )

    rejected = (
        db.query(StaffLeave)
        .join(
            Staff,
            Staff.id
            == StaffLeave.staff_id,
        )
        .filter(
            Staff.is_deleted.is_(False),
            StaffLeave.status
            == "REJECTED",
        )
        .count()
    )

    cancelled = (
        db.query(StaffLeave)
        .join(
            Staff,
            Staff.id
            == StaffLeave.staff_id,
        )
        .filter(
            Staff.is_deleted.is_(False),
            StaffLeave.status
            == "CANCELLED",
        )
        .count()
    )

    total_leave_days = (
        db.query(
            StaffLeave.total_days
        )
        .join(
            Staff,
            Staff.id
            == StaffLeave.staff_id,
        )
        .filter(
            Staff.is_deleted.is_(False),
            StaffLeave.status
            == "APPROVED",
        )
        .all()
    )

    total_days = sum(
        (
            row[0]
            for row in total_leave_days
            if row[0] is not None
        ),
        Decimal("0"),
    )

    return {
        "total_requests": total_requests,

        "pending": pending,

        "approved": approved,

        "rejected": rejected,

        "cancelled": cancelled,

        "total_leave_days": total_days,
    }


# =====================================================
# GET SINGLE LEAVE
# =====================================================

@router.get(
    "/{leave_id}",
    response_model=StaffLeaveResponse,
)
def get_staff_leave(
    leave_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_staff_leave_manager
    ),
):

    leave = (
        db.query(StaffLeave)
        .filter(
            StaffLeave.id
            == leave_id,
        )
        .first()
    )

    if not leave:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff leave request not found.",
        )

    return leave


# =====================================================
# UPDATE LEAVE
# =====================================================

@router.put(
    "/{leave_id}",
    response_model=StaffLeaveResponse,
)
def update_staff_leave(
    leave_id: int,

    payload: StaffLeaveUpdate,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_staff_leave_manager
    ),
):

    leave = (
        db.query(StaffLeave)
        .filter(
            StaffLeave.id
            == leave_id,
        )
        .first()
    )

    if not leave:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff leave request not found.",
        )

    # ---------------------------------------------
    # Prevent editing finalized requests
    # ---------------------------------------------

    if leave.status in {
        "APPROVED",
        "REJECTED",
        "CANCELLED",
    }:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Finalized leave requests "
                "cannot be edited."
            ),
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    # ---------------------------------------------
    # Status
    # ---------------------------------------------

    if "status" in update_data:

        new_status = (
            update_data["status"]
            or ""
        ).upper()

        allowed_statuses = {
            "PENDING",
            "APPROVED",
            "REJECTED",
            "CANCELLED",
        }

        if new_status not in allowed_statuses:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid leave status."
                ),
            )

        update_data["status"] = new_status

    # ---------------------------------------------
    # Dates
    # ---------------------------------------------

    new_start_date = update_data.get(
        "start_date",
        leave.start_date,
    )

    new_end_date = update_data.get(
        "end_date",
        leave.end_date,
    )

    total_days = calculate_leave_days(
        new_start_date,
        new_end_date,
    )

    # ---------------------------------------------
    # Check overlapping leave
    # ---------------------------------------------

    staff_id = update_data.get(
        "staff_id",
        leave.staff_id,
    )

    overlapping_leave = (
        db.query(StaffLeave)
        .filter(
            StaffLeave.id != leave.id,

            StaffLeave.staff_id
            == staff_id,

            StaffLeave.status.in_(
                [
                    "PENDING",
                    "APPROVED",
                ]
            ),

            StaffLeave.start_date
            <= new_end_date,

            StaffLeave.end_date
            >= new_start_date,
        )
        .first()
    )

    if overlapping_leave:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Another pending or approved "
                "leave overlaps these dates."
            ),
        )

    # ---------------------------------------------
    # Apply updates
    # ---------------------------------------------

    for field, value in update_data.items():

        if (
            field == "leave_type"
            and value is not None
        ):
            value = value.upper()

        setattr(
            leave,
            field,
            value,
        )

    leave.total_days = total_days

    try:

        db.commit()

        db.refresh(leave)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not update staff leave."
            ),
        )

    return leave


# =====================================================
# APPROVE LEAVE
# =====================================================

@router.patch(
    "/{leave_id}/approve",
    response_model=StaffLeaveResponse,
)
def approve_staff_leave(
    leave_id: int,

    approval_remarks: Optional[str] = Query(
        None,
        max_length=500,
    ),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_staff_leave_manager
    ),
):

    leave = (
        db.query(StaffLeave)
        .filter(
            StaffLeave.id
            == leave_id,
        )
        .first()
    )

    if not leave:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff leave request not found.",
        )

    if leave.status != "PENDING":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only pending leave requests "
                "can be approved."
            ),
        )

    leave.status = "APPROVED"

    leave.approval_remarks = (
        approval_remarks
    )

    leave.approved_at = datetime.now()

    leave.approved_by = getattr(
        current_user,
        "id",
        None,
    )

    try:

        db.commit()

        db.refresh(leave)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not approve staff leave."
            ),
        )

    return leave


# =====================================================
# REJECT LEAVE
# =====================================================

@router.patch(
    "/{leave_id}/reject",
    response_model=StaffLeaveResponse,
)
def reject_staff_leave(
    leave_id: int,

    approval_remarks: Optional[str] = Query(
        None,
        max_length=500,
    ),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_staff_leave_manager
    ),
):

    leave = (
        db.query(StaffLeave)
        .filter(
            StaffLeave.id
            == leave_id,
        )
        .first()
    )

    if not leave:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff leave request not found.",
        )

    if leave.status != "PENDING":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only pending leave requests "
                "can be rejected."
            ),
        )

    leave.status = "REJECTED"

    leave.approval_remarks = (
        approval_remarks
    )

    leave.approved_at = datetime.now()

    leave.approved_by = getattr(
        current_user,
        "id",
        None,
    )

    try:

        db.commit()

        db.refresh(leave)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not reject staff leave."
            ),
        )

    return leave


# =====================================================
# CANCEL LEAVE
# =====================================================

@router.patch(
    "/{leave_id}/cancel",
    response_model=StaffLeaveResponse,
)
def cancel_staff_leave(
    leave_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_staff_leave_manager
    ),
):

    leave = (
        db.query(StaffLeave)
        .filter(
            StaffLeave.id
            == leave_id,
        )
        .first()
    )

    if not leave:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff leave request not found.",
        )

    if leave.status not in {
        "PENDING",
        "APPROVED",
    }:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only pending or approved "
                "leave requests can be cancelled."
            ),
        )

    leave.status = "CANCELLED"

    try:

        db.commit()

        db.refresh(leave)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not cancel staff leave."
            ),
        )

    return leave


# =====================================================
# DELETE LEAVE
# =====================================================

@router.delete(
    "/{leave_id}"
)
def delete_staff_leave(
    leave_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_staff_leave_manager
    ),
):

    leave = (
        db.query(StaffLeave)
        .filter(
            StaffLeave.id
            == leave_id,
        )
        .first()
    )

    if not leave:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff leave request not found.",
        )

    db.delete(leave)

    try:

        db.commit()

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not delete staff leave."
            ),
        )

    return {
        "message": (
            "Staff leave deleted successfully."
        ),
        "leave_id": leave_id,
    }