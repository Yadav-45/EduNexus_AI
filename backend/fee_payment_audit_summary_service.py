from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.fee_payment import FeePayment


def get_fee_payment_audit_summary(
    db: Session,
) -> dict:
    total_payments = (
        db.query(func.count(FeePayment.id))
        .scalar()
        or 0
    )

    successful_payments = (
        db.query(func.count(FeePayment.id))
        .filter(
            FeePayment.status == "SUCCESS"
        )
        .scalar()
        or 0
    )

    reversed_payments = (
        db.query(func.count(FeePayment.id))
        .filter(
            FeePayment.status == "REVERSED"
        )
        .scalar()
        or 0
    )

    total_successful_collection = (
        db.query(func.sum(FeePayment.amount))
        .filter(
            FeePayment.status == "SUCCESS"
        )
        .scalar()
        or Decimal("0.00")
    )

    total_reversed_amount = (
        db.query(func.sum(FeePayment.amount))
        .filter(
            FeePayment.status == "REVERSED"
        )
        .scalar()
        or Decimal("0.00")
    )

    payment_method_rows = (
        db.query(
            FeePayment.payment_method,
            func.count(FeePayment.id),
            func.sum(FeePayment.amount),
        )
        .filter(
            FeePayment.status == "SUCCESS"
        )
        .group_by(
            FeePayment.payment_method
        )
        .order_by(
            FeePayment.payment_method
        )
        .all()
    )

    payment_methods = []

    for method, count, amount in payment_method_rows:
        payment_methods.append(
            {
                "payment_method": method,
                "payment_count": count,
                "total_amount": amount
                or Decimal("0.00"),
            }
        )

    return {
        "total_payments": total_payments,
        "successful_payments": successful_payments,
        "reversed_payments": reversed_payments,
        "total_successful_collection": (
            total_successful_collection
        ),
        "total_reversed_amount": (
            total_reversed_amount
        ),
        "payment_methods": payment_methods,
    }