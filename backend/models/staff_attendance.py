from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Time,
    DateTime,
    Text,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from database import Base


class StaffAttendance(Base):
    __tablename__ = "staff_attendance"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # STAFF REFERENCE
    # ============================================================

    staff_id = Column(
        Integer,
        ForeignKey("staff.id"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # ATTENDANCE DATE
    # ============================================================

    attendance_date = Column(
        Date,
        nullable=False,
        index=True,
    )

    # ============================================================
    # ATTENDANCE STATUS
    # ============================================================

    status = Column(
        String(30),
        nullable=False,
        default="PRESENT",
        index=True,
    )

    # Possible values:
    #
    # PRESENT
    # ABSENT
    # HALF_DAY
    # LATE
    # ON_LEAVE
    # HOLIDAY
    # WEEK_OFF
    #
    # We keep this as String so the school can expand
    # attendance rules later.

    # ============================================================
    # CHECK IN / CHECK OUT
    # ============================================================

    check_in = Column(
        Time,
        nullable=True,
    )

    check_out = Column(
        Time,
        nullable=True,
    )

    # ============================================================
    # WORKING HOURS
    # ============================================================

    working_hours = Column(
        String(20),
        nullable=True,
    )

    # Example:
    # "7h 25m"

    # ============================================================
    # REMARKS
    # ============================================================

    remarks = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # SYSTEM FIELDS
    # ============================================================

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

    # ============================================================
    # CONSTRAINTS
    # ============================================================

    __table_args__ = (
        UniqueConstraint(
            "staff_id",
            "attendance_date",
            name="uq_staff_attendance_staff_date",
        ),
    )