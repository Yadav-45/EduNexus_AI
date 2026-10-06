from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from fee_fine_schemas import FeeFineManagementResponse
from fee_fine_service import get_fee_fines


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Fine Management"],
)


@router.get(
    "/fines",
    response_model=FeeFineManagementResponse,
)
def get_fines(
    academic_year: str | None = Query(
        default=None,
        max_length=20,
    ),
    student_id: int | None = Query(
        default=None,
        ge=1,
    ),
    status: str | None = Query(
        default="ACTIVE",
        max_length=30,
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=25,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    return get_fee_fines(
        db=db,
        academic_year=academic_year,
        student_id=student_id,
        status=status,
        page=page,
        page_size=page_size,
    )