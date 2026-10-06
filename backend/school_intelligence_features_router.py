from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db
from models.user import User

from school_intelligence_features import get_intelligence_features
from school_intelligence_features_schemas import (
    SchoolIntelligenceFeaturesResponse,
)


router = APIRouter(
    prefix="/ai/intelligence",
    tags=["AI Intelligence Features"],
)


AUTHORIZED_ROLES = (
    "OWNER",
    "ADMIN",
)


@router.get(
    "/features",
    response_model=SchoolIntelligenceFeaturesResponse,
)
def get_school_intelligence_features(
    limit: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*AUTHORIZED_ROLES)
    ),
):
    result = get_intelligence_features(
        db=db,
        limit=limit,
    )

    return {
        "success": True,
        **result,
    }