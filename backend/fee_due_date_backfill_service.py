from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from models.fee_account import FeeAccount
from fee_service import get_active_fee_fine_policy


def backfill_missing_fee_due_dates(
    db: Session,
) -> dict:
    """
    Backfill due dates for existing fee accounts
    that do not currently have a due date.

    Existing fee amounts, payments, balances, and
    accounts with an existing due date are untouched.
    """

    accounts = (
        db.query(FeeAccount)
        .filter(
            FeeAccount.due_date.is_(None),
            FeeAccount.status == "ACTIVE",
        )
        .order_by(FeeAccount.id.asc())
        .all()
    )

    updated_accounts = []
    skipped_accounts = []

    for account in accounts:

        policy = get_active_fee_fine_policy(
            db=db,
            academic_year=account.academic_year,
        )

        if not policy:
            skipped_accounts.append({
                "fee_account_id": account.id,
                "academic_year": account.academic_year,
                "reason": "No active fee fine policy found.",
            })
            continue

        created_at = account.created_at

        if created_at is None:
            created_at = datetime.now()

        due_date = created_at + timedelta(
            days=policy.due_after_days
        )

        account.due_date = due_date

        updated_accounts.append({
            "fee_account_id": account.id,
            "academic_year": account.academic_year,
            "due_date": due_date,
        })

    db.commit()

    return {
        "success": True,
        "updated_count": len(updated_accounts),
        "skipped_count": len(skipped_accounts),
        "updated_accounts": updated_accounts,
        "skipped_accounts": skipped_accounts,
    }