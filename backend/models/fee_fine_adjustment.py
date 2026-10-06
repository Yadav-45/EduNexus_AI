from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.sql import func

from database import Base


class FeeFineAdjustment(Base):
    __tablename__ = "fee_fine_adjustments"

    id = Column(Integer, primary_key=True, index=True)

    fee_fine_id = Column(
        Integer,
        ForeignKey("fee_fines.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    adjusted_amount = Column(
        Numeric(12, 2),
        nullable=False,
    )

    adjustment_type = Column(
        String(30),
        nullable=False,
    )

    reason = Column(
        Text,
        nullable=False,
    )

    adjusted_by_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )