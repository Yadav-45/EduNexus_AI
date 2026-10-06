from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from models.fee_account import FeeAccount
from models.fee_payment import FeePayment
from models.fee_receipt import FeeReceipt


def reverse_fee_payment(
    db: Session,
    payment: FeePayment,
    reason: str,
) -> dict:
    reason = reason.strip()

    if not reason:
        raise ValueError(
            "Reversal reason is required."
        )

    if payment.status != "SUCCESS":
        raise ValueError(
            "Only successful payments can be reversed."
        )

    fee_account = (
        db.query(FeeAccount)
        .filter(
            FeeAccount.id == payment.fee_account_id
        )
        .first()
    )

    if not fee_account:
        raise ValueError(
            "Fee account not found."
        )

    previous_balance = Decimal(
        fee_account.balance or 0
    )

    amount = Decimal(
        payment.amount or 0
    )

    fee_account.total_paid = max(
        Decimal(
            fee_account.total_paid or 0
        ) - amount,
        Decimal("0.00"),
    )

    fee_account.balance = (
        fee_account.total_due
        - fee_account.total_paid
    )

    payment.status = "REVERSED"

    payment.reversal_reason = reason

    payment.reversed_at = datetime.now(
        timezone.utc
    )

    receipt = (
        db.query(FeeReceipt)
        .filter(
            FeeReceipt.fee_payment_id == payment.id
        )
        .first()
    )

    receipt_status = None

    if receipt:
        receipt.status = "REVERSED"
        receipt_status = receipt.status

    db.flush()

    return {
        "success": True,
        "payment_id": payment.id,
        "fee_account_id": fee_account.id,
        "student_id": fee_account.student_id,
        "amount_reversed": amount,
        "previous_balance": previous_balance,
        "new_balance": Decimal(
            fee_account.balance or 0
        ),
        "payment_status": payment.status,
        "receipt_status": receipt_status,
        "reversed_at": payment.reversed_at,
        "reason": reason,
        "message": (
            "Fee payment reversed successfully."
        ),
    }