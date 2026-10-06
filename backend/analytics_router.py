from datetime import date, datetime, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from auth.dependencies import require_roles

from models.user import User
from models.student import Student
from models.parent import Parent
from models.admission import Admission
from models.fee_account import FeeAccount
from models.fee_payment import FeePayment
from models.accounting_income import AccountingIncome
from models.accounting_expense import AccountingExpense
from attendance_model import Attendance


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

ANALYTICS_ROLES = (
    "OWNER",
    "ADMIN",
    "ACCOUNTANT",
    "TEACHER",
)


def money(value):
    if value is None:
        return 0.0
    return float(Decimal(str(value)))


@router.get("/overview")
def analytics_overview(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ANALYTICS_ROLES)),
):
    student_total = db.query(func.count(Student.id)).scalar() or 0
    active_students = (
        db.query(func.count(Student.id))
        .filter(Student.status == "ACTIVE")
        .scalar()
        or 0
    )
    parent_total = db.query(func.count(Parent.id)).scalar() or 0
    staff_total = (
        db.query(func.count(User.id))
        .filter(User.role.in_(["OWNER", "ADMIN", "ACCOUNTANT", "TEACHER"]))
        .scalar()
        or 0
    )

    teacher_total = (
        db.query(func.count(User.id))
        .filter(User.role == "TEACHER")
        .scalar()
        or 0
    )

    pending_admissions = (
        db.query(func.count(Admission.id))
        .filter(
            Admission.status.in_(
                [
                    "APPLIED",
                    "UNDER_REVIEW",
                    "SHORTLISTED",
                    "WAITLISTED",
                ]
            )
        )
        .scalar()
        or 0
    )

    enrolled_admissions = (
        db.query(func.count(Admission.id))
        .filter(Admission.status == "ENROLLED")
        .scalar()
        or 0
    )

    total_fee_due = (
        db.query(func.coalesce(func.sum(FeeAccount.total_due), 0))
        .scalar()
    )
    total_fee_paid = (
        db.query(func.coalesce(func.sum(FeeAccount.total_paid), 0))
        .scalar()
    )
    total_fee_balance = (
        db.query(func.coalesce(func.sum(FeeAccount.balance), 0))
        .scalar()
    )

    total_income = (
        db.query(func.coalesce(func.sum(AccountingIncome.amount), 0))
        .filter(AccountingIncome.status == "POSTED")
        .scalar()
    )

    total_expense = (
        db.query(func.coalesce(func.sum(AccountingExpense.amount), 0))
        .filter(AccountingExpense.status == "POSTED")
        .scalar()
    )

    today = date.today()

    today_attendance = (
        db.query(Attendance.status, func.count(Attendance.id))
        .filter(Attendance.attendance_date == today)
        .group_by(Attendance.status)
        .all()
    )

    attendance_today = {
        "PRESENT": 0,
        "ABSENT": 0,
        "LATE": 0,
        "LEAVE": 0,
    }

    for status, count in today_attendance:
        attendance_today[status] = count

    total_marked = sum(attendance_today.values())
    present_like = (
        attendance_today["PRESENT"] + attendance_today["LATE"]
    )

    attendance_percentage = (
        round((present_like / total_marked) * 100, 2)
        if total_marked
        else 0
    )

    return {
        "students": {
            "total": student_total,
            "active": active_students,
        },
        "parents": {
            "total": parent_total,
        },
        "staff": {
            "total": staff_total,
            "teachers": teacher_total,
        },
        "admissions": {
            "pending": pending_admissions,
            "enrolled": enrolled_admissions,
        },
        "fees": {
            "total_due": money(total_fee_due),
            "total_paid": money(total_fee_paid),
            "balance": money(total_fee_balance),
            "collection_percentage": (
                round(
                    (money(total_fee_paid) / money(total_fee_due)) * 100,
                    2,
                )
                if money(total_fee_due)
                else 0
            ),
        },
        "finance": {
            "income": money(total_income),
            "expense": money(total_expense),
            "net": money(total_income) - money(total_expense),
        },
        "attendance_today": {
            **attendance_today,
            "total_marked": total_marked,
            "attendance_percentage": attendance_percentage,
        },
    }


@router.get("/monthly")
def analytics_monthly(
    months: int = Query(default=12, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ANALYTICS_ROLES)),
):
    today = date.today()
    first_month = date(
        today.year if today.month >= months else today.year - 1,
        ((today.month - months) % 12) + 1,
        1,
    )

    income_rows = (
        db.query(
            func.extract("year", AccountingIncome.transaction_date),
            func.extract("month", AccountingIncome.transaction_date),
            func.sum(AccountingIncome.amount),
        )
        .filter(
            AccountingIncome.status == "POSTED",
            AccountingIncome.transaction_date >= first_month,
        )
        .group_by(
            func.extract("year", AccountingIncome.transaction_date),
            func.extract("month", AccountingIncome.transaction_date),
        )
        .all()
    )

    expense_rows = (
        db.query(
            func.extract("year", AccountingExpense.transaction_date),
            func.extract("month", AccountingExpense.transaction_date),
            func.sum(AccountingExpense.amount),
        )
        .filter(
            AccountingExpense.status == "POSTED",
            AccountingExpense.transaction_date >= first_month,
        )
        .group_by(
            func.extract("year", AccountingExpense.transaction_date),
            func.extract("month", AccountingExpense.transaction_date),
        )
        .all()
    )

    payment_rows = (
        db.query(
            func.extract("year", FeePayment.payment_date),
            func.extract("month", FeePayment.payment_date),
            func.sum(FeePayment.amount),
        )
        .filter(
            FeePayment.status == "SUCCESS",
            FeePayment.payment_date >= first_month,
        )
        .group_by(
            func.extract("year", FeePayment.payment_date),
            func.extract("month", FeePayment.payment_date),
        )
        .all()
    )

    admission_rows = (
        db.query(
            func.extract("year", Admission.application_date),
            func.extract("month", Admission.application_date),
            func.count(Admission.id),
        )
        .filter(Admission.application_date >= first_month)
        .group_by(
            func.extract("year", Admission.application_date),
            func.extract("month", Admission.application_date),
        )
        .all()
    )

    def key(year, month):
        return f"{int(year):04d}-{int(month):02d}"

    income = {
        key(year, month): money(amount)
        for year, month, amount in income_rows
    }
    expenses = {
        key(year, month): money(amount)
        for year, month, amount in expense_rows
    }
    payments = {
        key(year, month): money(amount)
        for year, month, amount in payment_rows
    }
    admissions = {
        key(year, month): int(count)
        for year, month, count in admission_rows
    }

    result = []

    year = first_month.year
    month = first_month.month

    for _ in range(months):
        month_key = f"{year:04d}-{month:02d}"
        result.append(
            {
                "month": month_key,
                "income": income.get(month_key, 0),
                "expenses": expenses.get(month_key, 0),
                "net": income.get(month_key, 0)
                - expenses.get(month_key, 0),
                "fee_collection": payments.get(month_key, 0),
                "admissions": admissions.get(month_key, 0),
            }
        )

        month += 1
        if month == 13:
            month = 1
            year += 1

    return {
        "months": result,
        "period_months": months,
    }


@router.get("/attendance")
def analytics_attendance(
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ANALYTICS_ROLES)),
):
    if end_date is None:
        end_date = date.today()

    if start_date is None:
        start_date = end_date - timedelta(days=29)

    rows = (
        db.query(
            Attendance.attendance_date,
            Attendance.status,
            func.count(Attendance.id),
        )
        .filter(
            Attendance.attendance_date >= start_date,
            Attendance.attendance_date <= end_date,
        )
        .group_by(
            Attendance.attendance_date,
            Attendance.status,
        )
        .order_by(Attendance.attendance_date.asc())
        .all()
    )

    dates = {}

    for attendance_date, status, count in rows:
        item = dates.setdefault(
            attendance_date.isoformat(),
            {
                "date": attendance_date.isoformat(),
                "present": 0,
                "absent": 0,
                "late": 0,
                "leave": 0,
                "total": 0,
            },
        )

        item[status.lower()] = int(count)
        item["total"] += int(count)

    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "data": list(dates.values()),
    }


@router.get("/admissions")
def analytics_admissions(
    academic_year: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("OWNER", "ADMIN")),
):
    query = db.query(
        Admission.status,
        func.count(Admission.id),
    )

    if academic_year:
        query = query.filter(
            Admission.academic_year == academic_year
        )

    rows = query.group_by(Admission.status).all()

    status_counts = {
        status: int(count)
        for status, count in rows
    }

    total = sum(status_counts.values())

    return {
        "academic_year": academic_year,
        "total": total,
        "by_status": status_counts,
    }


@router.get("/classes")
def analytics_classes(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ANALYTICS_ROLES)),
):
    rows = (
        db.query(
            Student.class_name,
            func.count(Student.id),
        )
        .filter(
            Student.status == "ACTIVE",
            Student.class_name.isnot(None),
        )
        .group_by(Student.class_name)
        .order_by(Student.class_name.asc())
        .all()
    )

    return {
        "data": [
            {
                "class_name": class_name,
                "students": int(count),
            }
            for class_name, count in rows
        ]
    }
