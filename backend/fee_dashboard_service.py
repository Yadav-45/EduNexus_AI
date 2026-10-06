from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.fee_account import FeeAccount
from models.fee_payment import FeePayment


def get_fee_dashboard_summary(
    db: Session,
) -> dict:
    """
    Return the overall fee collection summary.
    """

    total_due = (
        db.query(
            func.coalesce(
                func.sum(FeeAccount.total_due),
                0,
            )
        )
        .scalar()
    )

    total_paid = (
        db.query(
            func.coalesce(
                func.sum(FeeAccount.total_paid),
                0,
            )
        )
        .scalar()
    )

    total_balance = (
        db.query(
            func.coalesce(
                func.sum(FeeAccount.balance),
                0,
            )
        )
        .scalar()
    )

    total_accounts = (
        db.query(
            func.count(FeeAccount.id)
        )
        .scalar()
    )

    active_accounts = (
        db.query(
            func.count(FeeAccount.id)
        )
        .filter(
            FeeAccount.status == "ACTIVE"
        )
        .scalar()
    )

    total_payments = (
        db.query(
            func.count(FeePayment.id)
        )
        .filter(
            FeePayment.status == "SUCCESS"
        )
        .scalar()
    )

    return {
        "total_due": Decimal(total_due or 0),
        "total_paid": Decimal(total_paid or 0),
        "total_balance": Decimal(
            total_balance or 0
        ),
        "total_accounts": total_accounts or 0,
        "active_accounts": active_accounts or 0,
        "total_successful_payments": (
            total_payments or 0
        ),
    }