from sqlalchemy import Boolean, Column, Integer, Numeric, String
from database import Base


class FeeFinePolicy(Base):
    __tablename__ = "fee_fine_policies"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(150),
        nullable=False,
    )

    academic_year = Column(
        String(20),
        nullable=True,
        index=True,
    )

    due_after_days = Column(
        Integer,
        nullable=False,
        default=30,
    )

    grace_period_days = Column(
        Integer,
        nullable=False,
        default=0,
    )

    fine_type = Column(
        String(20),
        nullable=False,
        default="FIXED",
    )

    fine_value = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    recurring_fine = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    recurring_period_days = Column(
        Integer,
        nullable=False,
        default=30,
    )

    status = Column(
        String(30),
        nullable=False,
        default="ACTIVE",
        index=True,
    )