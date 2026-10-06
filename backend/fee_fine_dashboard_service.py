from decimal import Decimal

from sqlalchemy.orm import Session

from models.fee_account import FeeAccount
from models.fee_fine import FeeFine
from models.fee_fine_adjustment import FeeFineAdjustment


def get_fee_fine_dashboard_overview(
    db: Session,
    academic_year: str | None = None,
) -> dict:

    account_query = db.query(FeeAccount)

    if academic_year:
        account_query = account_query.filter(
            FeeAccount.academic_year == academic_year
        )

    accounts = account_query.all()

    total_fee_accounts = len(accounts)
    current_accounts = 0
    overdue_accounts = 0
    paid_accounts = 0

    total_outstanding = Decimal("0.00")
    total_overdue = Decimal("0.00")

    aging_buckets = {
        "CURRENT": 0,
        "0-30": 0,
        "31-60": 0,
        "61-90": 0,
        "90+": 0,
        "PAID": 0,
        "NO_DUE_DATE": 0,
    }

    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)

    for account in accounts:

        balance = Decimal(account.balance or 0)

        if balance <= 0:
            paid_accounts += 1
            aging_buckets["PAID"] += 1
            continue

        total_outstanding += balance

        if not account.due_date:
            aging_buckets["NO_DUE_DATE"] += 1
            continue

        due_date = account.due_date

        if due_date.tzinfo is None:
            due_date = due_date.replace(tzinfo=timezone.utc)

        if due_date >= now:
            current_accounts += 1
            aging_buckets["CURRENT"] += 1
            continue

        overdue_accounts += 1
        total_overdue += balance

        days_overdue = (now.date() - due_date.date()).days

        if days_overdue <= 30:
            aging_buckets["0-30"] += 1
        elif days_overdue <= 60:
            aging_buckets["31-60"] += 1
        elif days_overdue <= 90:
            aging_buckets["61-90"] += 1
        else:
            aging_buckets["90+"] += 1

    fine_query = db.query(FeeFine)

    if academic_year:
        fine_query = fine_query.join(
            FeeAccount,
            FeeFine.fee_account_id == FeeAccount.id,
        ).filter(
            FeeAccount.academic_year == academic_year
        )

    fines = fine_query.all()

    total_fines = Decimal("0.00")
    active_fines = Decimal("0.00")
    waived_fines = Decimal("0.00")

    for fine in fines:
        amount = Decimal(fine.amount or 0)

        total_fines += amount

        if fine.status == "ACTIVE":
            active_fines += amount
        elif fine.status == "WAIVED":
            waived_fines += amount

    adjustment_query = db.query(FeeFineAdjustment)

    if academic_year:
        adjustment_query = (
            adjustment_query
            .join(
                FeeFine,
                FeeFineAdjustment.fee_fine_id == FeeFine.id,
            )
            .join(
                FeeAccount,
                FeeFine.fee_account_id == FeeAccount.id,
            )
            .filter(
                FeeAccount.academic_year == academic_year
            )
        )

    adjustments = adjustment_query.all()

    total_adjustments = len(adjustments)

    total_adjusted_amount = Decimal("0.00")

    for adjustment in adjustments:
        total_adjusted_amount += Decimal(
            adjustment.adjusted_amount or 0
        )

    return {
        "total_fee_accounts": total_fee_accounts,
        "current_accounts": current_accounts,
        "overdue_accounts": overdue_accounts,
        "paid_accounts": paid_accounts,
        "total_outstanding": total_outstanding,
        "total_overdue": total_overdue,
        "total_fines": total_fines,
        "active_fines": active_fines,
        "waived_fines": waived_fines,
        "total_adjustments": total_adjustments,
        "total_adjusted_amount": total_adjusted_amount,
        "aging_buckets": aging_buckets,
    }