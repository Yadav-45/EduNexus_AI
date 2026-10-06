from datetime import datetime

from sqlalchemy.orm import Session

from models.fee_payment import FeePayment
from models.fee_receipt import FeeReceipt


def generate_receipt_number(db: Session) -> str:
    """
    Generate a unique receipt number.

    Format:
    REC-YYYY-000001
    """

    year = datetime.now().year

    last_receipt = (
        db.query(FeeReceipt)
        .filter(
            FeeReceipt.receipt_number.like(
                f"REC-{year}-%"
            )
        )
        .order_by(
            FeeReceipt.id.desc()
        )
        .first()
    )

    if last_receipt:
        last_number = int(
            last_receipt.receipt_number.split("-")[-1]
        )
        next_number = last_number + 1
    else:
        next_number = 1

    return f"REC-{year}-{next_number:06d}"


def create_fee_receipt(
    db: Session,
    payment: FeePayment,
    previous_balance,
) -> FeeReceipt:
    """
    Create a receipt for a successful fee payment.
    """

    if payment.status != "SUCCESS":
        raise ValueError(
            "Only successful payments can have receipts."
        )

    existing_receipt = (
        db.query(FeeReceipt)
        .filter(
            FeeReceipt.fee_payment_id
            == payment.id
        )
        .first()
    )

    if existing_receipt:
        raise ValueError(
            "A receipt already exists for this payment."
        )

    remaining_balance = (
        previous_balance - payment.amount
    )

    if remaining_balance < 0:
        raise ValueError(
            "Remaining balance cannot be negative."
        )

    receipt = FeeReceipt(
        receipt_number=generate_receipt_number(db),
        fee_payment_id=payment.id,
        fee_account_id=payment.fee_account_id,
        amount=payment.amount,
        previous_balance=previous_balance,
        remaining_balance=remaining_balance,
        payment_method=payment.payment_method,
        transaction_reference=(
            payment.transaction_reference
        ),
        remarks=payment.remarks,
        status="ISSUED",
    )

    db.add(receipt)
    db.flush()

    return receipt