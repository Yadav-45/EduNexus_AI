from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.sql import func

from database import Base


class FeeAccount(Base):
    __tablename__ = "fee_accounts"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    student_id = Column(
        Integer,
        ForeignKey(
            "students.id",
            ondelete="CASCADE",
        ),
        unique=True,
        nullable=False,
        index=True,
    )

    academic_year = Column(
        String(20),
        nullable=False,
        index=True,
    )

    total_due = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    total_paid = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    balance = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    status = Column(
        String(30),
        nullable=False,
        default="ACTIVE",
        index=True,
    )

    due_date = Column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )