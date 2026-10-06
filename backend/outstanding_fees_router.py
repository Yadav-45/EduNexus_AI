from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from outstanding_fees_schemas import (
    OutstandingFeesResponse,
)

from outstanding_fees_service import (
    get_outstanding_fees,
)


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Dashboard"],
)


@router.get(
    "/outstanding",
    response_model=OutstandingFeesResponse,
)
def get_outstanding_fee_accounts(
    search: str | None = Query(
        default=None,
        max_length=100,
    ),
    academic_year: str | None = Query(
        default=None,
        max_length=20,
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
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    return get_outstanding_fees(
        db=db,
        search=search,
        academic_year=academic_year,
        page=page,
        page_size=page_size,
    )