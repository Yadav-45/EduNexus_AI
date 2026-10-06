from datetime import date

from sqlalchemy import Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy import UniqueConstraint

from database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    student_id = Column(
        Integer,
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    attendance_date = Column(
        Date,
        nullable=False,
        default=date.today,
        index=True,
    )

    status = Column(
        String(20),
        nullable=False,
        default="PRESENT",
    )

    remarks = Column(
        Text,
        nullable=True,
    )

    marked_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "attendance_date",
            name="uq_student_attendance_date",
        ),
    )