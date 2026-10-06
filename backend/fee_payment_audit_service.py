from sqlalchemy import or_
from sqlalchemy.orm import Session

from models.fee_account import FeeAccount
from models.fee_payment import FeePayment
from models.fee_receipt import FeeReceipt
from models.student import Student


def get_fee_payment_audit_history(
    db: Session,
    search: str | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 25,
) -> dict:
    query = (
        db.query(
            FeePayment,
            FeeAccount,
            Student,
            FeeReceipt,
        )
        .join(
            FeeAccount,
            FeeAccount.id == FeePayment.fee_account_id,
        )
        .join(
            Student,
            Student.id == FeeAccount.student_id,
        )
        .outerjoin(
            FeeReceipt,
            FeeReceipt.fee_payment_id == FeePayment.id,
        )
    )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Student.first_name.ilike(search_value),
                Student.last_name.ilike(search_value),
                Student.admission_number.ilike(search_value),
                FeePayment.transaction_reference.ilike(
                    search_value
                ),
                FeeReceipt.receipt_number.ilike(
                    search_value
                ),
            )
        )

    if status:
        query = query.filter(
            FeePayment.status == status.upper()
        )

    total = query.count()

    offset = (page - 1) * page_size

    rows = (
        query
        .order_by(
            FeePayment.payment_date.desc(),
            FeePayment.id.desc(),
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    data = []

    for payment, fee_account, student, receipt in rows:
        data.append(
            {
                "payment_id": payment.id,
                "student_id": student.id,
                "admission_number": (
                    student.admission_number
                ),
                "student_name": (
                    f"{student.first_name} "
                    f"{student.last_name or ''}"
                ).strip(),
                "fee_account_id": fee_account.id,
                "amount": payment.amount,
                "payment_method": (
                    payment.payment_method
                ),
                "transaction_reference": (
                    payment.transaction_reference
                ),
                "payment_date": payment.payment_date,
                "payment_status": payment.status,
                "receipt_id": (
                    receipt.id
                    if receipt
                    else None
                ),
                "receipt_number": (
                    receipt.receipt_number
                    if receipt
                    else None
                ),
                "receipt_status": (
                    receipt.status
                    if receipt
                    else None
                ),
                "reversal_reason": (
                    payment.reversal_reason
                ),
                "reversed_at": (
                    payment.reversed_at
                ),
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