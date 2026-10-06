from decimal import Decimal

from sqlalchemy.orm import Session

from models.fee_account import FeeAccount
from models.fee_fine import FeeFine

from fee_aging_service import calculate_fee_aging
from fee_service import get_active_fee_fine_policy


def apply_automatic_fines(
    db: Session,
    academic_year: str | None = None,
) -> dict:
    """
    Identify overdue fee accounts and create fine records.

    This does not modify:
    - total_due
    - total_paid
    - balance
    - payments
    - receipts
    """

    query = (
        db.query(FeeAccount)
        .filter(
            FeeAccount.status == "ACTIVE",
            FeeAccount.balance > 0,
            FeeAccount.due_date.isnot(None),
        )
    )

    if academic_year:
        query = query.filter(
            FeeAccount.academic_year == academic_year
        )

    accounts = query.order_by(
        FeeAccount.id.asc()
    ).all()

    created_fines = []
    skipped_accounts = []

    for account in accounts:

        policy = get_active_fee_fine_policy(
            db=db,
            academic_year=account.academic_year,
        )

        if not policy:
            skipped_accounts.append({
                "fee_account_id": account.id,
                "reason": "No active fee fine policy found.",
            })
            continue

        aging = calculate_fee_aging(
            fee_account=account,
            grace_period_days=policy.grace_period_days,
            fine_type=policy.fine_type,
            fine_value=policy.fine_value,
            recurring_fine=policy.recurring_fine,
            recurring_period_days=policy.recurring_period_days,
        )

        fine_amount = Decimal(
            aging["fine_amount"] or 0
        )

        if fine_amount <= 0:
            continue

        existing_fine = (
            db.query(FeeFine)
            .filter(
                FeeFine.fee_account_id == account.id,
                FeeFine.status == "ACTIVE",
                FeeFine.days_overdue == aging["days_overdue"],
            )
            .first()
        )

        if existing_fine:
            skipped_accounts.append({
                "fee_account_id": account.id,
                "reason": "Fine already exists for current overdue period.",
            })
            continue

        fine = FeeFine(
            fee_account_id=account.id,
            amount=fine_amount,
            fine_type=policy.fine_type,
            days_overdue=aging["days_overdue"],
            reason=(
                f"Automatic late fee after "
                f"{aging['days_overdue']} days overdue."
            ),
            status="ACTIVE",
        )

        db.add(fine)
        db.flush()

        created_fines.append({
            "fine_id": fine.id,
            "fee_account_id": account.id,
            "amount": fine.amount,
            "fine_type": fine.fine_type,
            "days_overdue": fine.days_overdue,
        })

    db.commit()

    return {
        "success": True,
        "created_count": len(created_fines),
        "skipped_count": len(skipped_accounts),
        "created_fines": created_fines,
        "skipped_accounts": skipped_accounts,
    }