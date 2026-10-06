from datetime import date, datetime

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.sql import func

from database import Base


class AccountingIncome(Base):
    __tablename__ = "accounting_income"

    id = Column(Integer, primary_key=True, index=True)

    transaction_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    transaction_date = Column(
        Date,
        nullable=False,
        default=date.today,
        index=True,
    )

    income_category = Column(
        String(50),
        nullable=False,
        index=True,
    )

    description = Column(
        String(255),
        nullable=False,
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False,
    )

    payment_method = Column(
        String(30),
        nullable=True,
        index=True,
    )

    reference_number = Column(
        String(100),
        nullable=True,
        index=True,
    )

    student_id = Column(
        Integer,
        ForeignKey("students.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    fee_payment_id = Column(
        Integer,
        ForeignKey("fee_payments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="COMPLETED",
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    __table_args__ = (
        Index(
            "ix_accounting_income_date_category",
            "transaction_date",
            "income_category",
        ),
        Index(
            "ix_accounting_income_status_date",
            "status",
            "transaction_date",
        ),
    )