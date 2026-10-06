from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.sql import func

from database import Base


class FeeReceipt(Base):
    __tablename__ = "fee_receipts"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    receipt_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    fee_payment_id = Column(
        Integer,
        ForeignKey(
            "fee_payments.id",
            ondelete="CASCADE",
        ),
        unique=True,
        nullable=False,
        index=True,
    )

    fee_account_id = Column(
        Integer,
        ForeignKey(
            "fee_accounts.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False,
    )

    previous_balance = Column(
        Numeric(12, 2),
        nullable=False,
    )

    remaining_balance = Column(
        Numeric(12, 2),
        nullable=False,
    )

    payment_method = Column(
        String(30),
        nullable=False,
    )

    transaction_reference = Column(
        String(100),
        nullable=True,
    )

    receipt_date = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    remarks = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="ISSUED",
        index=True,
    )