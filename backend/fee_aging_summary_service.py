from decimal import Decimal

from sqlalchemy.orm import Session

from models.fee_account import FeeAccount
from models.student import Student
from fee_aging_service import calculate_fee_aging
from fee_service import get_active_fee_fine_policy


def get_fee_aging_summary(
    db: Session,
    academic_year: str | None = None,
) -> dict:
    """
    Return an aggregated fee aging summary.

    Uses the active FeeFinePolicy for each academic year.
    Does not modify any database records.
    """

    query = (
        db.query(FeeAccount, Student)
        .join(
            Student,
            Student.id == FeeAccount.student_id,
        )
        .filter(
            FeeAccount.status == "ACTIVE",
        )
    )

    if academic_year:
        query = query.filter(
            FeeAccount.academic_year == academic_year
        )

    rows = query.all()

    total_accounts = 0
    current_accounts = 0
    overdue_accounts = 0
    paid_accounts = 0

    total_outstanding = Decimal("0.00")
    total_overdue = Decimal("0.00")
    total_fines = Decimal("0.00")
    total_with_fines = Decimal("0.00")

    aging_buckets = {
        "CURRENT": {
            "accounts": 0,
            "outstanding": Decimal("0.00"),
            "fine": Decimal("0.00"),
        },
        "0-30": {
            "accounts": 0,
            "outstanding": Decimal("0.00"),
            "fine": Decimal("0.00"),
        },
        "31-60": {
            "accounts": 0,
            "outstanding": Decimal("0.00"),
            "fine": Decimal("0.00"),
        },
        "61-90": {
            "accounts": 0,
            "outstanding": Decimal("0.00"),
            "fine": Decimal("0.00"),
        },
        "90+": {
            "accounts": 0,
            "outstanding": Decimal("0.00"),
            "fine": Decimal("0.00"),
        },
        "PAID": {
            "accounts": 0,
            "outstanding": Decimal("0.00"),
            "fine": Decimal("0.00"),
        },
        "NO_DUE_DATE": {
            "accounts": 0,
            "outstanding": Decimal("0.00"),
            "fine": Decimal("0.00"),
        },
    }

    for fee_account, student in rows:
        total_accounts += 1

        policy = get_active_fee_fine_policy(
            db=db,
            academic_year=fee_account.academic_year,
        )

        if policy:
            grace_period_days = policy.grace_period_days
            fine_type = policy.fine_type
            fine_value = policy.fine_value
            recurring_fine = policy.recurring_fine
            recurring_period_days = policy.recurring_period_days
        else:
            grace_period_days = 0
            fine_type = "FIXED"
            fine_value = Decimal("0.00")
            recurring_fine = False
            recurring_period_days = 30

        aging = calculate_fee_aging(
            fee_account=fee_account,
            grace_period_days=grace_period_days,
            fine_type=fine_type,
            fine_value=fine_value,
            recurring_fine=recurring_fine,
            recurring_period_days=recurring_period_days,
        )

        bucket = aging["aging_bucket"]

        if bucket not in aging_buckets:
            bucket = "NO_DUE_DATE"

        outstanding = Decimal(
            aging["outstanding_amount"] or 0
        )

        fine = Decimal(
            aging["fine_amount"] or 0
        )

        total_with_fine = Decimal(
            aging["total_due_with_fine"] or 0
        )

        aging_buckets[bucket]["accounts"] += 1
        aging_buckets[bucket]["outstanding"] += outstanding
        aging_buckets[bucket]["fine"] += fine

        total_outstanding += outstanding
        total_fines += fine
        total_with_fines += total_with_fine

        if bucket == "PAID":
            paid_accounts += 1
        elif bucket == "CURRENT":
            current_accounts += 1
        elif bucket not in {"NO_DUE_DATE"}:
            overdue_accounts += 1
            total_overdue += outstanding

    return {
        "academic_year": academic_year,
        "total_accounts": total_accounts,
        "current_accounts": current_accounts,
        "overdue_accounts": overdue_accounts,
        "paid_accounts": paid_accounts,
        "total_outstanding": total_outstanding,
        "total_overdue": total_overdue,
        "total_fines": total_fines,
        "total_with_fines": total_with_fines,
        "aging_buckets": aging_buckets,
    }