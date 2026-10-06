from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Text,
    ForeignKey,
    Numeric,
)
from sqlalchemy.sql import func

from database import Base


class StaffLeave(Base):
    __tablename__ = "staff_leaves"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    staff_id = Column(
        Integer,
        ForeignKey("staff.id"),
        nullable=False,
        index=True,
    )

    leave_type = Column(
        String(50),
        nullable=False,
        index=True,
    )

    start_date = Column(
        Date,
        nullable=False,
        index=True,
    )

    end_date = Column(
        Date,
        nullable=False,
        index=True,
    )

    total_days = Column(
        Numeric(5, 2),
        nullable=False,
    )

    reason = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="PENDING",
        index=True,
    )

    approval_remarks = Column(
        Text,
        nullable=True,
    )

    approved_by = Column(
        Integer,
        nullable=True,
    )

    approved_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )