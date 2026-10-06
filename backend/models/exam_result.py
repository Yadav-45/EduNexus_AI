from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    Text,
    ForeignKey,
    Numeric,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from database import Base


class ExamResult(Base):
    __tablename__ = "exam_results"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    exam_id = Column(
        Integer,
        ForeignKey("exams.id"),
        nullable=False,
        index=True,
    )

    exam_paper_id = Column(
        Integer,
        ForeignKey("exam_papers.id"),
        nullable=False,
        index=True,
    )

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False,
        index=True,
    )

    marks_obtained = Column(
        Numeric(10, 2),
        nullable=True,
    )

    maximum_marks = Column(
        Numeric(10, 2),
        nullable=False,
        default=100,
    )

    passing_marks = Column(
        Numeric(10, 2),
        nullable=False,
        default=33,
    )

    percentage = Column(
        Numeric(6, 2),
        nullable=True,
    )

    result_status = Column(
        String(30),
        nullable=False,
        default="PENDING",
        index=True,
    )

    is_absent = Column(
        Boolean,
        nullable=False,
        default=False,
        index=True,
    )

    is_published = Column(
        Boolean,
        nullable=False,
        default=False,
        index=True,
    )

    remarks = Column(
        Text,
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

    __table_args__ = (
        UniqueConstraint(
            "exam_paper_id",
            "student_id",
            name="uq_exam_result_paper_student",
        ),
    )