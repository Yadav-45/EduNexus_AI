from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from models.fee_account import FeeAccount
from models.student import Student
from fee_fine_policy import calculate_late_fine
from fee_service import get_active_fee_fine_policy


def get_aging_bucket(days_overdue: int) -> str:
    if days_overdue <= 30:
        return "0-30"
    if days_overdue <= 60:
        return "31-60"
    if days_overdue <= 90:
        return "61-90"
    return "90+"


def calculate_fee_aging(
    fee_account: FeeAccount,
    grace_period_days: int = 0,
    fine_type: str = "FIXED",
    fine_value: Decimal = Decimal("0.00"),
    recurring_fine: bool = False,
    recurring_period_days: int = 30,
) -> dict:

    outstanding = Decimal(fee_account.balance or 0)

    if outstanding <= 0:
        return {
            "due_date": fee_account.due_date,
            "days_overdue": 0,
            "aging_bucket": "PAID",
            "outstanding_amount": Decimal("0.00"),
            "fine_amount": Decimal("0.00"),
            "total_due_with_fine": Decimal("0.00"),
        }

    if fee_account.due_date is None:
        return {
            "due_date": None,
            "days_overdue": 0,
            "aging_bucket": "NO_DUE_DATE",
            "outstanding_amount": outstanding,
            "fine_amount": Decimal("0.00"),
            "total_due_with_fine": outstanding,
        }

    due_date = fee_account.due_date

    if due_date.tzinfo is None:
        due_date = due_date.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)

    days_overdue = max((now - due_date).days, 0)

    if days_overdue == 0:
        aging_bucket = "CURRENT"
    else:
        aging_bucket = get_aging_bucket(days_overdue)

    fine_amount = calculate_late_fine(
        outstanding_amount=outstanding,
        days_overdue=days_overdue,
        grace_period_days=grace_period_days,
        fine_type=fine_type,
        fine_value=fine_value,
        recurring=recurring_fine,
        recurring_period_days=recurring_period_days,
    )

    total_due_with_fine = outstanding + fine_amount

    return {
        "due_date": fee_account.due_date,
        "days_overdue": days_overdue,
        "aging_bucket": aging_bucket,
        "outstanding_amount": outstanding,
        "fine_amount": fine_amount,
        "total_due_with_fine": total_due_with_fine,
    }


def get_fee_defaulters(
    db: Session,
    search: str | None = None,
    academic_year: str | None = None,
    aging_bucket: str | None = None,
    page: int = 1,
    page_size: int = 25,
) -> dict:

    query = (
        db.query(FeeAccount, Student)
        .join(
            Student,
            Student.id == FeeAccount.student_id,
        )
        .filter(
            FeeAccount.status == "ACTIVE",
            FeeAccount.balance > 0,
        )
    )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            (Student.first_name.ilike(search_value))
            | (Student.last_name.ilike(search_value))
            | (Student.admission_number.ilike(search_value))
        )

    if academic_year:
        query = query.filter(
            FeeAccount.academic_year == academic_year
        )

    rows = (
        query
        .order_by(
            FeeAccount.due_date.asc().nullsfirst(),
            Student.first_name.asc(),
        )
        .all()
    )

    records = []

    for fee_account, student in rows:

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

        if aging_bucket:
            if aging["aging_bucket"] != aging_bucket.upper():
                continue

        records.append({
            "fee_account_id": fee_account.id,
            "student_id": student.id,
            "admission_number": student.admission_number,
            "student_name": (
                f"{student.first_name} "
                f"{student.last_name or ''}"
            ).strip(),
            "class_name": student.class_name,
            "academic_year": fee_account.academic_year,
            "total_due": fee_account.total_due,
            "total_paid": fee_account.total_paid,
            "outstanding_amount": aging["outstanding_amount"],
            "due_date": aging["due_date"],
            "days_overdue": aging["days_overdue"],
            "aging_bucket": aging["aging_bucket"],
            "fine_amount": aging["fine_amount"],
            "total_due_with_fine": aging["total_due_with_fine"],
        })

    total = len(records)

    offset = (page - 1) * page_size

    paginated_records = records[
        offset: offset + page_size
    ]

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    return {
        "data": paginated_records,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
        },
    }