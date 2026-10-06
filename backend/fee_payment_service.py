from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from models.fee_account import FeeAccount
from models.fee_payment import FeePayment
from models.accounting_income import AccountingIncome


def generate_income_transaction_number(
    db: Session,
) -> str:
    """
    Generate a unique accounting income transaction number.

    Format:
        INC-2026-000001
        INC-2026-000002
        ...
    """

    year = date.today().year
    prefix = f"INC-{year}-"

    last_transaction = (
        db.query(AccountingIncome)
        .filter(
            AccountingIncome.transaction_number.like(
                f"{prefix}%"
            )
        )
        .order_by(
            AccountingIncome.id.desc()
        )
        .first()
    )

    if last_transaction:
        try:
            last_number = int(
                last_transaction.transaction_number.split(
                    "-"
                )[-1]
            )
        except (ValueError, IndexError):
            last_number = 0
    else:
        last_number = 0

    return f"{prefix}{last_number + 1:06d}"


def create_fee_payment(
    db: Session,
    fee_account: FeeAccount,
    amount: Decimal,
    payment_method: str,
    transaction_reference: str | None = None,
    remarks: str | None = None,
) -> FeePayment:
    """
    Record a fee payment, update the student's
    fee account, and create the corresponding
    accounting income transaction.

    The operation remains transactional:
    payment + fee account update + accounting income
    are flushed together and are committed by the
    calling API route.
    """

    # ========================================================
    # VALIDATE FEE ACCOUNT
    # ========================================================

    if fee_account.status != "ACTIVE":
        raise ValueError(
            "Fee account is not active."
        )

    # ========================================================
    # VALIDATE PAYMENT AMOUNT
    # ========================================================

    if amount <= 0:
        raise ValueError(
            "Payment amount must be greater than zero."
        )

    outstanding_balance = (
        fee_account.total_due
        - fee_account.total_paid
    )

    if amount > outstanding_balance:
        raise ValueError(
            "Payment amount cannot exceed "
            f"the outstanding balance of "
            f"{outstanding_balance:.2f}."
        )

    # ========================================================
    # CREATE FEE PAYMENT
    # ========================================================

    payment = FeePayment(
        fee_account_id=fee_account.id,
        amount=amount,
        payment_method=payment_method.upper(),
        transaction_reference=transaction_reference,
        remarks=remarks,
        status="SUCCESS",
    )

    db.add(payment)

    # ========================================================
    # UPDATE FEE ACCOUNT
    # ========================================================

    fee_account.total_paid = (
        fee_account.total_paid + amount
    )

    fee_account.balance = (
        fee_account.total_due
        - fee_account.total_paid
    )

    # ========================================================
    # CREATE ACCOUNTING INCOME
    # ========================================================

    transaction_number = (
        generate_income_transaction_number(db)
    )

    accounting_income = AccountingIncome(
        transaction_number=transaction_number,
        transaction_date=date.today(),
        income_category="FEE_COLLECTION",
        description=(
            f"Fee payment for fee account "
            f"{fee_account.id}"
        ),
        amount=amount,
        payment_method=payment_method.upper(),
        reference_number=transaction_reference,
        student_id=fee_account.student_id,
        fee_payment_id=None,
        status="COMPLETED",
        notes=remarks,
    )

    db.add(accounting_income)

    # ========================================================
    # FLUSH
    # ========================================================

    db.flush()

    # Now the FeePayment has its generated database ID.
    # Link Accounting Income to that payment.
    accounting_income.fee_payment_id = payment.id

    db.flush()

    return payment