from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from fee_fine_analytics_schemas import (
    FeeFineAnalyticsResponse,
)

from fee_fine_analytics_service import (
    get_fee_fine_analytics,
)


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Fine Analytics"],
)


@router.get(
    "/fine-analytics",
    response_model=FeeFineAnalyticsResponse,
)
def get_fine_analytics(
    academic_year: str | None = Query(
        default=None,
        max_length=20,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    return get_fee_fine_analytics(
        db=db,
        academic_year=academic_year,
    )