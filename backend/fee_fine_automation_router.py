from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from fee_fine_automation_service import (
    apply_automatic_fines,
)


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Fine Automation"],
)


@router.post("/apply-fines")
def apply_fines(
    academic_year: str | None = Query(
        default=None,
        max_length=20,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    return apply_automatic_fines(
        db=db,
        academic_year=academic_year,
    )