from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Text,
    ForeignKey,
    Numeric,
    Boolean,
)
from sqlalchemy.sql import func

from database import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)

    # ============================================================
    # BASIC EXAM INFORMATION
    # ============================================================

    exam_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    exam_name = Column(
        String(150),
        nullable=False,
        index=True,
    )

    exam_type = Column(
        String(50),
        nullable=False,
        default="TERM",
        index=True,
    )

    academic_year = Column(
        String(20),
        nullable=False,
        index=True,
    )

    term = Column(
        String(50),
        nullable=True,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # CLASS INFORMATION
    # ============================================================

    class_name = Column(
        String(50),
        nullable=False,
        index=True,
    )

    section = Column(
        String(20),
        nullable=True,
        index=True,
    )

    # ============================================================
    # SUBJECT INFORMATION
    # ============================================================

    subject_name = Column(
        String(100),
        nullable=False,
        index=True,
    )

    subject_code = Column(
        String(50),
        nullable=True,
        index=True,
    )

    # ============================================================
    # EXAM SCHEDULE
    # ============================================================

    exam_date = Column(
        Date,
        nullable=False,
        index=True,
    )

    start_time = Column(
        String(20),
        nullable=True,
    )

    end_time = Column(
        String(20),
        nullable=True,
    )

    duration_minutes = Column(
        Integer,
        nullable=True,
    )

    room_number = Column(
        String(50),
        nullable=True,
    )

    # ============================================================
    # MARKS CONFIGURATION
    # ============================================================

    maximum_marks = Column(
        Numeric(8, 2),
        nullable=False,
        default=100,
    )

    passing_marks = Column(
        Numeric(8, 2),
        nullable=False,
        default=33,
    )

    # ============================================================
    # STATUS
    # ============================================================

    status = Column(
        String(30),
        nullable=False,
        default="SCHEDULED",
        index=True,
    )

    is_published = Column(
        Boolean,
        nullable=False,
        default=False,
        index=True,
    )

    # ============================================================
    # ADDITIONAL INFORMATION
    # ============================================================

    instructions = Column(
        Text,
        nullable=True,
    )

    remarks = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # AUDIT FIELDS
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