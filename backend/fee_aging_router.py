from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from fee_aging_schemas import FeeDefaulterResponse
from fee_aging_service import get_fee_defaulters


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Aging & Defaulters"],
)


@router.get(
    "/defaulters",
    response_model=FeeDefaulterResponse,
)
def get_defaulters(
    search: str | None = Query(
        default=None,
        max_length=100,
    ),
    academic_year: str | None = Query(
        default=None,
        max_length=20,
    ),
    aging_bucket: str | None = Query(
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
        require_roles("OWNER", "ADMIN")
    ),
):
    return get_fee_defaulters(
        db=db,
        search=search,
        academic_year=academic_year,
        aging_bucket=aging_bucket,
        page=page,
        page_size=page_size,
    )