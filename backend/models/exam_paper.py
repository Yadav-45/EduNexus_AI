from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Time,
    DateTime,
    Boolean,
    Text,
    ForeignKey,
    Numeric,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from database import Base


class ExamPaper(Base):
    __tablename__ = "exam_papers"

    id = Column(Integer, primary_key=True, index=True)

    exam_id = Column(
        Integer,
        ForeignKey("exams.id"),
        nullable=False,
        index=True,
    )

    paper_name = Column(
        String(150),
        nullable=False,
    )

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

    class_name = Column(
        String(50),
        nullable=True,
        index=True,
    )

    section = Column(
        String(50),
        nullable=True,
        index=True,
    )

    exam_date = Column(
        Date,
        nullable=True,
        index=True,
    )

    start_time = Column(
        Time,
        nullable=True,
    )

    end_time = Column(
        Time,
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

    instructions = Column(
        Text,
        nullable=True,
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
            "exam_id",
            "subject_name",
            name="uq_exam_paper_exam_subject",
        ),
    )