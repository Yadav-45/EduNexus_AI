from datetime import date
from math import ceil
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db

from auth.dependencies import require_roles

from models.admission import Admission

from admission_schemas import (
    ADMISSION_STATUSES,
    AdmissionCreate,
    AdmissionListResponse,
    AdmissionResponse,
    AdmissionStatusUpdate,
    AdmissionUpdate,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/admissions",
    tags=["Admissions"],
)


# ============================================================
# STATUS VALIDATION
# ============================================================

def validate_status(status: str) -> str:

    status = status.strip().upper()

    if status not in ADMISSION_STATUSES:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid admission status. "
                "Allowed statuses: "
                + ", ".join(
                    sorted(ADMISSION_STATUSES)
                )
            ),
        )

    return status


# ============================================================
# APPLICATION NUMBER
# ============================================================

def generate_temporary_application_number(
    academic_year: str,
) -> str:

    return (
        f"TEMP-{academic_year}-"
        f"{uuid4().hex}"
    )


# ============================================================
# CREATE ADMISSION
# ============================================================

@router.post(
    "",
    response_model=AdmissionResponse,
)
def create_admission(

    payload: AdmissionCreate,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):

    status = validate_status(
        payload.status
    )

    data = payload.model_dump()

    data["status"] = status

    data["application_date"] = (
        payload.application_date
        or date.today()
    )

    # Temporary number is required before
    # the database generates the ID.
    data["application_number"] = (
        generate_temporary_application_number(
            payload.academic_year
        )
    )

    admission = Admission(
        **data
    )

    db.add(admission)

    db.flush()

    # Replace temporary number with
    # permanent human-readable number.
    admission.application_number = (
        f"ADM-"
        f"{payload.academic_year}-"
        f"{admission.id:06d}"
    )

    db.commit()

    db.refresh(admission)

    return admission


# ============================================================
# LIST ADMISSIONS
# ============================================================

@router.get(
    "",
    response_model=AdmissionListResponse,
)
def list_admissions(

    page: int = Query(
        1,
        ge=1,
        description="Page number",
    ),

    page_size: int = Query(
        25,
        ge=1,
        le=100,
        description="Records per page",
    ),

    search: str | None = Query(
        None,
        description=(
            "Search application number, "
            "student name, parent name, "
            "phone or email"
        ),
    ),

    status: str | None = Query(
        None,
        description="Admission status",
    ),

    academic_year: str | None = Query(
        None,
        description="Academic year",
    ),

    applying_class: str | None = Query(
        None,
        description="Applying class",
    ),

    is_active: bool = Query(
        True,
        description="Show active admissions",
    ),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):

    query = (
        db.query(Admission)
        .filter(
            Admission.is_active
            == is_active
        )
    )

    # ========================================================
    # SEARCH
    # ========================================================

    if search:

        search_text = search.strip()

        term = (
            f"%"
            f"{search_text}"
            f"%"
        )

        query = query.filter(
            or_(
                Admission.application_number.ilike(
                    term
                ),

                Admission.first_name.ilike(
                    term
                ),

                Admission.last_name.ilike(
                    term
                ),

                Admission.parent_name.ilike(
                    term
                ),

                Admission.parent_phone.ilike(
                    term
                ),

                Admission.parent_email.ilike(
                    term
                ),
            )
        )

    # ========================================================
    # STATUS FILTER
    # ========================================================

    if status:

        validated_status = validate_status(
            status
        )

        query = query.filter(
            Admission.status
            == validated_status
        )

    # ========================================================
    # ACADEMIC YEAR FILTER
    # ========================================================

    if academic_year:

        query = query.filter(
            Admission.academic_year
            == academic_year
        )

    # ========================================================
    # CLASS FILTER
    # ========================================================

    if applying_class:

        query = query.filter(
            Admission.applying_class
            == applying_class
        )

    # ========================================================
    # TOTAL RECORDS
    # ========================================================

    total = query.count()

    # ========================================================
    # TOTAL PAGES
    # ========================================================

    total_pages = (
        ceil(
            total / page_size
        )
        if total > 0
        else 0
    )

    # ========================================================
    # PAGINATION
    # ========================================================

    offset = (
        page - 1
    ) * page_size

    items = (
        query
        .order_by(
            Admission.id.desc()
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return AdmissionListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


# ============================================================
# GET SINGLE ADMISSION
# ============================================================

@router.get(
    "/{admission_id}",
    response_model=AdmissionResponse,
)
def get_admission(

    admission_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):

    admission = (
        db.query(Admission)
        .filter(
            Admission.id
            == admission_id,

            Admission.is_active
            == True,
        )
        .first()
    )

    if not admission:

        raise HTTPException(
            status_code=404,
            detail="Admission not found",
        )

    return admission


# ============================================================
# UPDATE ADMISSION
# ============================================================

@router.put(
    "/{admission_id}",
    response_model=AdmissionResponse,
)
def update_admission(

    admission_id: int,

    payload: AdmissionUpdate,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):

    admission = (
        db.query(Admission)
        .filter(
            Admission.id
            == admission_id,

            Admission.is_active
            == True,
        )
        .first()
    )

    if not admission:

        raise HTTPException(
            status_code=404,
            detail="Admission not found",
        )

    data = payload.model_dump(
        exclude_unset=True
    )

    # ========================================================
    # VALIDATE STATUS IF PROVIDED
    # ========================================================

    if (
        "status" in data
        and data["status"] is not None
    ):

        data["status"] = (
            validate_status(
                data["status"]
            )
        )

    # ========================================================
    # UPDATE FIELDS
    # ========================================================

    for field, value in data.items():

        setattr(
            admission,
            field,
            value,
        )

    db.commit()

    db.refresh(admission)

    return admission


# ============================================================
# UPDATE ADMISSION STATUS
# ============================================================

@router.patch(
    "/{admission_id}/status",
    response_model=AdmissionResponse,
)
def update_admission_status(

    admission_id: int,

    payload: AdmissionStatusUpdate,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):

    admission = (
        db.query(Admission)
        .filter(
            Admission.id
            == admission_id,

            Admission.is_active
            == True,
        )
        .first()
    )

    if not admission:

        raise HTTPException(
            status_code=404,
            detail="Admission not found",
        )

    admission.status = (
        validate_status(
            payload.status
        )
    )

    db.commit()

    db.refresh(admission)

    return admission


# ============================================================
# DELETE / ARCHIVE ADMISSION
# ============================================================

@router.delete(
    "/{admission_id}",
)
def delete_admission(

    admission_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):

    admission = (
        db.query(Admission)
        .filter(
            Admission.id
            == admission_id,

            Admission.is_active
            == True,
        )
        .first()
    )

    if not admission:

        raise HTTPException(
            status_code=404,
            detail="Admission not found",
        )

    # --------------------------------------------------------
    # SOFT DELETE
    # --------------------------------------------------------
    # We do not permanently delete the record.
    # This preserves the admission for audit/history.
    # --------------------------------------------------------

    admission.is_active = False

    db.commit()

    return {
        "message": (
            "Admission deleted successfully"
        ),
        "id": admission_id,
        "application_number": (
            admission.application_number
        ),
        "status": "ARCHIVED",
    }


# ============================================================
# RESTORE ARCHIVED ADMISSION
# ============================================================

@router.patch(
    "/{admission_id}/restore",
    response_model=AdmissionResponse,
)
def restore_admission(

    admission_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):

    admission = (
        db.query(Admission)
        .filter(
            Admission.id
            == admission_id
        )
        .first()
    )

    if not admission:

        raise HTTPException(
            status_code=404,
            detail="Admission not found",
        )

    admission.is_active = True

    db.commit()

    db.refresh(admission)

    return admission