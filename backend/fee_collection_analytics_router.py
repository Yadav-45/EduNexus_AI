from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from fee_collection_analytics_schemas import (
    FeeCollectionAnalyticsResponse,
)

from fee_collection_analytics_service import (
    get_collection_analytics,
)


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Dashboard"],
)


@router.get(
    "/collection-analytics",
    response_model=FeeCollectionAnalyticsResponse,
)
def get_fee_collection_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    return get_collection_analytics(db)