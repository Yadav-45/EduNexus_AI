from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.fee_payment import FeePayment


def get_collection_analytics(db: Session) -> dict:
    """
    Return fee collection analytics for the school.
    """

    today = datetime.now().date()
    tomorrow = today + timedelta(days=1)

    today_start = datetime.combine(
        today,
        datetime.min.time(),
    )

    tomorrow_start = datetime.combine(
        tomorrow,
        datetime.min.time(),
    )

    # Today's collection
    today_collection = (
        db.query(
            func.coalesce(
                func.sum(FeePayment.amount),
                0,
            )
        )
        .filter(
            FeePayment.status == "SUCCESS",
            FeePayment.payment_date >= today_start,
            FeePayment.payment_date < tomorrow_start,
        )
        .scalar()
    )

    # Today's payment count
    today_payment_count = (
        db.query(
            func.count(FeePayment.id)
        )
        .filter(
            FeePayment.status == "SUCCESS",
            FeePayment.payment_date >= today_start,
            FeePayment.payment_date < tomorrow_start,
        )
        .scalar()
    )

    # Collection grouped by payment method
    payment_method_rows = (
        db.query(
            FeePayment.payment_method,
            func.sum(FeePayment.amount).label(
                "total_amount"
            ),
            func.count(FeePayment.id).label(
                "payment_count"
            ),
        )
        .filter(
            FeePayment.status == "SUCCESS"
        )
        .group_by(
            FeePayment.payment_method
        )
        .order_by(
            func.sum(FeePayment.amount).desc()
        )
        .all()
    )

    collection_by_method = []

    for row in payment_method_rows:
        collection_by_method.append(
            {
                "payment_method": row.payment_method,
                "total_amount": Decimal(
                    row.total_amount or 0
                ),
                "payment_count": row.payment_count or 0,
            }
        )

    # Recent successful payments
    recent_payments = (
        db.query(FeePayment)
        .filter(
            FeePayment.status == "SUCCESS"
        )
        .order_by(
            FeePayment.payment_date.desc(),
            FeePayment.id.desc(),
        )
        .limit(10)
        .all()
    )

    recent_payment_data = []

    for payment in recent_payments:
        recent_payment_data.append(
            {
                "id": payment.id,
                "fee_account_id": payment.fee_account_id,
                "amount": Decimal(
                    payment.amount or 0
                ),
                "payment_method": payment.payment_method,
                "transaction_reference": (
                    payment.transaction_reference
                ),
                "payment_date": payment.payment_date,
                "status": payment.status,
            }
        )

    return {
        "today_collection": Decimal(
            today_collection or 0
        ),
        "today_payment_count": (
            today_payment_count or 0
        ),
        "collection_by_method": (
            collection_by_method
        ),
        "recent_payments": recent_payment_data,
    }