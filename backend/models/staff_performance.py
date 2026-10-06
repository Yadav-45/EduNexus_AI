from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Numeric,
    Text,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from database import Base


class StaffPerformance(Base):
    __tablename__ = "staff_performance"

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

    # ============================================================
    # REVIEW PERIOD
    # ============================================================

    review_period = Column(
        String(100),
        nullable=False,
        index=True,
    )

    review_start_date = Column(
        Date,
        nullable=False,
        index=True,
    )

    review_end_date = Column(
        Date,
        nullable=False,
        index=True,
    )

    review_date = Column(
        Date,
        nullable=True,
    )

    # ============================================================
    # PERFORMANCE SCORES
    # ============================================================

    teaching_quality_score = Column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    student_engagement_score = Column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    attendance_score = Column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    discipline_score = Column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    teamwork_score = Column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    communication_score = Column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    technology_score = Column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    leadership_score = Column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    # ============================================================
    # OVERALL PERFORMANCE
    # ============================================================

    overall_score = Column(
        Numeric(5, 2),
        nullable=False,
        default=0,
        index=True,
    )

    rating = Column(
        String(30),
        nullable=False,
        default="NOT_RATED",
        index=True,
    )

    # ============================================================
    # GOALS / KPIs
    # ============================================================

    goals = Column(
        Text,
        nullable=True,
    )

    goals_achieved = Column(
        Text,
        nullable=True,
    )

    kpi_score = Column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    # ============================================================
    # FEEDBACK
    # ============================================================

    strengths = Column(
        Text,
        nullable=True,
    )

    areas_for_improvement = Column(
        Text,
        nullable=True,
    )

    manager_comments = Column(
        Text,
        nullable=True,
    )

    employee_comments = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # CAREER / APPRAISAL RECOMMENDATIONS
    # ============================================================

    promotion_recommended = Column(
        String(10),
        nullable=False,
        default="NO",
    )

    increment_recommended = Column(
        String(10),
        nullable=False,
        default="NO",
    )

    recommended_increment_percentage = Column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    training_required = Column(
        String(10),
        nullable=False,
        default="NO",
    )

    training_recommendation = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # REVIEW STATUS
    # ============================================================

    status = Column(
        String(30),
        nullable=False,
        default="DRAFT",
        index=True,
    )

    # ============================================================
    # REVIEWER
    # ============================================================

    reviewed_by = Column(
        Integer,
        nullable=True,
    )

    reviewed_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ============================================================
    # GENERAL REMARKS
    # ============================================================

    remarks = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # TIMESTAMPS
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
            "review_period",
            name="uq_staff_performance_staff_review_period",
        ),
    )