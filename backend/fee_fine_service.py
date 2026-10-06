from decimal import Decimal

from sqlalchemy.orm import Session

from models.fee_fine import FeeFine
from models.fee_account import FeeAccount
from models.student import Student


def get_fee_fines(
    db: Session,
    academic_year: str | None = None,
    student_id: int | None = None,
    status: str | None = "ACTIVE",
    page: int = 1,
    page_size: int = 25,
) -> dict:

    query = (
        db.query(
            FeeFine,
            FeeAccount,
            Student,
        )
        .join(
            FeeAccount,
            FeeFine.fee_account_id == FeeAccount.id,
        )
        .join(
            Student,
            FeeAccount.student_id == Student.id,
        )
    )

    if academic_year:
        query = query.filter(
            FeeAccount.academic_year == academic_year
        )

    if student_id:
        query = query.filter(
            Student.id == student_id
        )

    if status:
        query = query.filter(
            FeeFine.status == status
        )

    total = query.count()

    total_fine_amount = Decimal("0.00")

    amount_rows = query.all()

    for fine, _, _ in amount_rows:
        total_fine_amount += Decimal(
            fine.amount or 0
        )

    offset = (page - 1) * page_size

    rows = (
        query
        .order_by(FeeFine.id.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    data = []

    for fine, fee_account, student in rows:
        student_name = student.first_name

        if student.last_name:
            student_name += f" {student.last_name}"

        data.append({
            "id": fine.id,
            "fee_account_id": fine.fee_account_id,
            "student_id": student.id,
            "student_name": student_name,
            "academic_year": fee_account.academic_year,
            "amount": fine.amount,
            "fine_type": fine.fine_type,
            "days_overdue": fine.days_overdue,
            "reason": fine.reason,
            "status": fine.status,
        })

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    return {
        "data": data,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
        },
        "total_fine_amount": total_fine_amount,
    }