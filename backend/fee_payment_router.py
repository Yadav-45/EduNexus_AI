from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.fee_account import FeeAccount
from models.fee_payment import FeePayment
from auth.dependencies import require_roles

from fee_payment_schemas import (
    FeePaymentCreate,
    FeePaymentResponse,
)

from fee_payment_service import (
    create_fee_payment,
)


router = APIRouter(
    prefix="/fee-accounts",
    tags=["Fee Payments"],
)


@router.post(
    "/{fee_account_id}/payments",
    response_model=FeePaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    fee_account_id: int,
    request: FeePaymentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    fee_account = (
        db.query(FeeAccount)
        .filter(
            FeeAccount.id
            == fee_account_id
        )
        .first()
    )

    if not fee_account:
        raise HTTPException(
            status_code=404,
            detail="Fee account not found.",
        )

    try:
        payment = create_fee_payment(
            db=db,
            fee_account=fee_account,
            amount=request.amount,
            payment_method=request.payment_method,
            transaction_reference=(
                request.transaction_reference
            ),
            remarks=request.remarks,
        )

        db.commit()
        db.refresh(payment)
        db.refresh(fee_account)

        return payment

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
                "Payment failed. "
                "All changes were rolled back."
            ),
        )


@router.get(
    "/{fee_account_id}/payments",
    response_model=list[FeePaymentResponse],
)
def get_fee_payments(
    fee_account_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    fee_account = (
        db.query(FeeAccount)
        .filter(
            FeeAccount.id
            == fee_account_id
        )
        .first()
    )

    if not fee_account:
        raise HTTPException(
            status_code=404,
            detail="Fee account not found.",
        )

    payments = (
        db.query(FeePayment)
        .filter(
            FeePayment.fee_account_id
            == fee_account_id
        )
        .order_by(
            FeePayment.id.desc()
        )
        .all()
    )

    return payments