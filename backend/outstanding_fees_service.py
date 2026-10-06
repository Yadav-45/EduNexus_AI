from sqlalchemy import or_
from sqlalchemy.orm import Session

from models.fee_account import FeeAccount
from models.student import Student


def get_outstanding_fees(
    db: Session,
    search: str | None = None,
    academic_year: str | None = None,
    page: int = 1,
    page_size: int = 25,
) -> dict:
    """
    Return students with outstanding fee balances.
    """

    query = (
        db.query(
            FeeAccount,
            Student,
        )
        .join(
            Student,
            Student.id == FeeAccount.student_id,
        )
        .filter(
            FeeAccount.balance > 0,
        )
    )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Student.first_name.ilike(search_value),
                Student.last_name.ilike(search_value),
                Student.admission_number.ilike(
                    search_value
                ),
            )
        )

    if academic_year:
        query = query.filter(
            FeeAccount.academic_year
            == academic_year
        )

    total = query.count()

    offset = (page - 1) * page_size

    rows = (
        query
        .order_by(
            FeeAccount.balance.desc(),
            Student.first_name.asc(),
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    data = []

    for fee_account, student in rows:
        data.append(
            {
                "fee_account_id": fee_account.id,
                "student_id": student.id,
                "admission_number": (
                    student.admission_number
                ),
                "student_name": (
                    f"{student.first_name} "
                    f"{student.last_name or ''}"
                ).strip(),
                "class_name": (
                    student.class_name
                ),
                "academic_year": (
                    fee_account.academic_year
                ),
                "total_due": (
                    fee_account.total_due
                ),
                "total_paid": (
                    fee_account.total_paid
                ),
                "outstanding_balance": (
                    fee_account.balance
                ),
                "status": fee_account.status,
            }
        )

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
    }