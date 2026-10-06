from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from fee_dashboard_schemas import (
    FeeDashboardSummaryResponse,
)

from fee_dashboard_service import (
    get_fee_dashboard_summary,
)


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Dashboard"],
)


@router.get(
    "/summary",
    response_model=FeeDashboardSummaryResponse,
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    return get_fee_dashboard_summary(db)