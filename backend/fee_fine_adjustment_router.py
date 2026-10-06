from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from fee_fine_adjustment_schemas import (
    FeeFineAdjustmentCreate,
    FeeFineAdjustmentResponse,
)

from fee_fine_adjustment_service import (
    adjust_fee_fine,
)


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Fine Adjustments"],
)


@router.post(
    "/fines/{fee_fine_id}/adjust",
    response_model=FeeFineAdjustmentResponse,
)
def adjust_fine(
    payload: FeeFineAdjustmentCreate,
    fee_fine_id: int = Path(
        ...,
        ge=1,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    return adjust_fee_fine(
        db=db,
        fee_fine_id=fee_fine_id,
        adjusted_amount=payload.adjusted_amount,
        adjustment_type=payload.adjustment_type,
        reason=payload.reason,
        current_user_id=current_user.id,
    )