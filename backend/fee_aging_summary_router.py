from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from fee_aging_summary_schemas import (
    FeeAgingSummaryResponse,
)

from fee_aging_summary_service import (
    get_fee_aging_summary,
)


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Aging & Defaulters"],
)


@router.get(
    "/aging-summary",
    response_model=FeeAgingSummaryResponse,
)
def fee_aging_summary(
    academic_year: str | None = Query(
        default=None,
        max_length=20,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    return get_fee_aging_summary(
        db=db,
        academic_year=academic_year,
    )