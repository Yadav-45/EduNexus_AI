from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db
from models.user import User

from school_intelligence_schemas import (
    SchoolIntelligenceCurrentResponse,
    SchoolIntelligenceHistoryResponse,
    SchoolIntelligenceSnapshotResponse,
)

from school_intelligence_service import (
    calculate_school_intelligence,
    create_school_intelligence_snapshot,
    get_school_intelligence_history,
)


router = APIRouter(
    prefix="/ai/intelligence",
    tags=["AI School Intelligence"],
)


AUTHORIZED_ROLES = (
    "OWNER",
    "ADMIN",
)


@router.get(
    "/current",
    response_model=SchoolIntelligenceCurrentResponse,
)
def get_current_intelligence(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*AUTHORIZED_ROLES)
    ),
):
    intelligence = calculate_school_intelligence(db)

    return {
        "success": True,
        **intelligence,
    }


@router.post(
    "/snapshot",
    response_model=SchoolIntelligenceSnapshotResponse,
)
def create_intelligence_snapshot(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("OWNER")
    ),
):
    return create_school_intelligence_snapshot(db)


@router.get(
    "/history",
    response_model=SchoolIntelligenceHistoryResponse,
)
def get_intelligence_history(
    limit: int = Query(
        default=30,
        ge=1,
        le=365,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*AUTHORIZED_ROLES)
    ),
):
    data = get_school_intelligence_history(
        db=db,
        limit=limit,
    )

    return {
        "success": True,
        "data": data,
        "total": len(data),
    }