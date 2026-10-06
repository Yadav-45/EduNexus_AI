from decimal import Decimal

from sqlalchemy.orm import Session

from models.fee_account import FeeAccount
from models.fee_payment import FeePayment
from models.fee_receipt import FeeReceipt
from models.student import Student


def get_student_fee_statement(
    db: Session,
    student_id: int,
) -> dict:
    """
    Return a complete fee statement for one student.
    """

    student = (
        db.query(Student)
        .filter(
            Student.id == student_id
        )
        .first()
    )

    if not student:
        raise ValueError(
            "Student not found."
        )

    fee_account = (
        db.query(FeeAccount)
        .filter(
            FeeAccount.student_id
            == student_id
        )
        .first()
    )

    if not fee_account:
        raise ValueError(
            "Fee account not found for this student."
        )

    payments = (
        db.query(FeePayment)
        .filter(
            FeePayment.fee_account_id
            == fee_account.id,
            FeePayment.status == "SUCCESS",
        )
        .order_by(
            FeePayment.payment_date.desc(),
            FeePayment.id.desc(),
        )
        .all()
    )

    receipts = (
        db.query(FeeReceipt)
        .filter(
            FeeReceipt.fee_account_id
            == fee_account.id
        )
        .order_by(
            FeeReceipt.receipt_date.desc(),
            FeeReceipt.id.desc(),
        )
        .all()
    )

    payment_data = []

    for payment in payments:
        payment_data.append(
            {
                "id": payment.id,
                "amount": Decimal(
                    payment.amount or 0
                ),
                "payment_method": (
                    payment.payment_method
                ),
                "transaction_reference": (
                    payment.transaction_reference
                ),
                "payment_date": (
                    payment.payment_date
                ),
                "status": payment.status,
            }
        )

    receipt_data = []

    for receipt in receipts:
        receipt_data.append(
            {
                "id": receipt.id,
                "receipt_number": (
                    receipt.receipt_number
                ),
                "payment_id": (
                    receipt.fee_payment_id
                ),
                "amount": Decimal(
                    receipt.amount or 0
                ),
                "previous_balance": Decimal(
                    receipt.previous_balance or 0
                ),
                "remaining_balance": Decimal(
                    receipt.remaining_balance or 0
                ),
                "payment_method": (
                    receipt.payment_method
                ),
                "transaction_reference": (
                    receipt.transaction_reference
                ),
                "receipt_date": (
                    receipt.receipt_date
                ),
                "status": receipt.status,
            }
        )

    return {
        "student_id": student.id,
        "admission_number": (
            student.admission_number
        ),
        "student_name": (
            f"{student.first_name} "
            f"{student.last_name or ''}"
        ).strip(),
        "class_name": student.class_name,
        "academic_year": (
            fee_account.academic_year
        ),
        "fee_account_id": fee_account.id,
        "total_due": Decimal(
            fee_account.total_due or 0
        ),
        "total_paid": Decimal(
            fee_account.total_paid or 0
        ),
        "outstanding_balance": Decimal(
            fee_account.balance or 0
        ),
        "fee_account_status": (
            fee_account.status
        ),
        "payments": payment_data,
        "receipts": receipt_data,
    }