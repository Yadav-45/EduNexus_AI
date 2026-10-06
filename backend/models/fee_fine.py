from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.sql import func

from database import Base


class FeeFine(Base):
    __tablename__ = "fee_fines"

    id = Column(Integer, primary_key=True, index=True)

    fee_account_id = Column(
        Integer,
        ForeignKey("fee_accounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False,
    )

    fine_type = Column(
        String(20),
        nullable=False,
    )

    days_overdue = Column(
        Integer,
        nullable=False,
    )

    reason = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="ACTIVE",
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )