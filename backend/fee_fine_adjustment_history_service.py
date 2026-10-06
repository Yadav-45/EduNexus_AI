from decimal import Decimal

from sqlalchemy.orm import Session

from models.fee_fine import FeeFine
from models.fee_fine_adjustment import FeeFineAdjustment
from models.fee_account import FeeAccount
from models.student import Student
from models.user import User


def get_fee_fine_adjustment_history(
    db: Session,
    fee_fine_id: int | None = None,
    academic_year: str | None = None,
    student_id: int | None = None,
    page: int = 1,
    page_size: int = 25,
) -> dict:

    query = (
        db.query(
            FeeFineAdjustment,
            FeeFine,
            FeeAccount,
            Student,
            User,
        )
        .join(
            FeeFine,
            FeeFineAdjustment.fee_fine_id == FeeFine.id,
        )
        .join(
            FeeAccount,
            FeeFine.fee_account_id == FeeAccount.id,
        )
        .join(
            Student,
            FeeAccount.student_id == Student.id,
        )
        .join(
            User,
            FeeFineAdjustment.adjusted_by_user_id == User.id,
        )
    )

    if fee_fine_id:
        query = query.filter(
            FeeFineAdjustment.fee_fine_id == fee_fine_id
        )

    if academic_year:
        query = query.filter(
            FeeAccount.academic_year == academic_year
        )

    if student_id:
        query = query.filter(
            Student.id == student_id
        )

    total = query.count()

    all_rows = query.all()

    total_adjusted_amount = Decimal("0.00")

    for adjustment, _, _, _, _ in all_rows:
        total_adjusted_amount += Decimal(
            adjustment.adjusted_amount or 0
        )

    offset = (page - 1) * page_size

    rows = (
        query
        .order_by(
            FeeFineAdjustment.id.desc()
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    data = []

    for (
        adjustment,
        fine,
        fee_account,
        student,
        user,
    ) in rows:

        student_name = student.first_name

        if student.last_name:
            student_name += f" {student.last_name}"

        adjusted_by_name = user.full_name

        created_at = None

        if adjustment.created_at:
            created_at = adjustment.created_at.isoformat()

        data.append({
            "id": adjustment.id,
            "fee_fine_id": fine.id,
            "student_id": student.id,
            "student_name": student_name,
            "fee_account_id": fee_account.id,
            "academic_year": fee_account.academic_year,
            "adjusted_amount": adjustment.adjusted_amount,
            "adjustment_type": adjustment.adjustment_type,
            "reason": adjustment.reason,
            "adjusted_by_user_id": adjustment.adjusted_by_user_id,
            "adjusted_by_user_name": adjusted_by_name,
            "created_at": created_at,
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
        "total_adjusted_amount": total_adjusted_amount,
    }
