from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from fee_fine_adjustment_history_schemas import (
    FeeFineAdjustmentHistoryResponse,
)

from fee_fine_adjustment_history_service import (
    get_fee_fine_adjustment_history,
)


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Fine Adjustment History"],
)


@router.get(
    "/fine-adjustments/history",
    response_model=FeeFineAdjustmentHistoryResponse,
)
def get_adjustment_history(
    fee_fine_id: int | None = Query(
        default=None,
        ge=1,
    ),
    academic_year: str | None = Query(
        default=None,
        max_length=20,
    ),
    student_id: int | None = Query(
        default=None,
        ge=1,
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
    return get_fee_fine_adjustment_history(
        db=db,
        fee_fine_id=fee_fine_id,
        academic_year=academic_year,
        student_id=student_id,
        page=page,
        page_size=page_size,
    )