from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from fee_fine_dashboard_schemas import (
    FeeFineDashboardOverviewResponse,
)

from fee_fine_dashboard_service import (
    get_fee_fine_dashboard_overview,
)


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Fine Dashboard"],
)


@router.get(
    "/fine-dashboard-overview",
    response_model=FeeFineDashboardOverviewResponse,
)
def get_fine_dashboard_overview(
    academic_year: str | None = Query(
        default=None,
        max_length=20,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    return get_fee_fine_dashboard_overview(
        db=db,
        academic_year=academic_year,
    )