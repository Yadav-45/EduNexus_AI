from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from models.fee_payment import FeePayment

from fee_payment_reversal_schemas import (
    FeePaymentReversalRequest,
    FeePaymentReversalResponse,
)

from fee_payment_reversal_service import (
    reverse_fee_payment,
)


router = APIRouter(
    prefix="/fee-payments",
    tags=["Fee Payment Reversal"],
)


@router.post(
    "/{payment_id}/reverse",
    response_model=FeePaymentReversalResponse,
)
def reverse_payment(
    payment_id: int,
    request: FeePaymentReversalRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    payment = (
        db.query(FeePayment)
        .filter(
            FeePayment.id == payment_id
        )
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Fee payment not found.",
        )

    try:
        result = reverse_fee_payment(
            db=db,
            payment=payment,
            reason=request.reason,
        )

        db.commit()

        return result

    except ValueError as exc:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Payment reversal failed. "
                "All changes were rolled back."
            ),
        )