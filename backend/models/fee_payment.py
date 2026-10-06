from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.sql import func

from database import Base


class FeePayment(Base):
    __tablename__ = "fee_payments"

    id = Column(
        Integer,
        primary_key=True,
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

    payment_method = Column(
        String(30),
        nullable=False,
        default="CASH",
    )

    transaction_reference = Column(
        String(100),
        nullable=True,
        index=True,
    )

    payment_date = Column(
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
        default="SUCCESS",
        index=True,
    )

    reversal_reason = Column(
        Text,
        nullable=True,
    )

    reversed_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )