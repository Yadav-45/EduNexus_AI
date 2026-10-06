from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db
from models.user import User

from school_intelligence_trend_service import get_school_trends
from school_intelligence_trend_schemas import (
    SchoolIntelligenceTrendResponse,
)


router = APIRouter(
    prefix="/ai/intelligence",
    tags=["AI Intelligence Trends"],
)


AUTHORIZED_ROLES = (
    "OWNER",
    "ADMIN",
)


@router.get(
    "/trends",
    response_model=SchoolIntelligenceTrendResponse,
)
def get_intelligence_trends(
    limit: int = Query(
        default=30,
        ge=2,
        le=365,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*AUTHORIZED_ROLES)
    ),
):
    return get_school_trends(
        db=db,
        limit=limit,
    )