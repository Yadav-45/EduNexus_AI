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


class AccountingExpense(Base):
    __tablename__ = "accounting_expenses"

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

    expense_category = Column(
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

    vendor_name = Column(
        String(200),
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

    # ---------------------------------------------------------
    # INVENTORY ACCOUNTING LINK
    # ---------------------------------------------------------

    inventory_movement_id = Column(
        Integer,
        ForeignKey(
            "inventory_movements.id",
            ondelete="SET NULL",
        ),
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
            "ix_accounting_expense_date_category",
            "transaction_date",
            "expense_category",
        ),
        Index(
            "ix_accounting_expense_status_date",
            "status",
            "transaction_date",
        ),
        Index(
            "ix_accounting_expense_inventory_movement",
            "inventory_movement_id",
        ),
    )