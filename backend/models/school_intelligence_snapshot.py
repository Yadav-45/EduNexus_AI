from sqlalchemy import Column, DateTime, Integer, Numeric, String
from sqlalchemy.sql import func

from database import Base


class SchoolIntelligenceSnapshot(Base):
    __tablename__ = "school_intelligence_snapshots"

    id = Column(Integer, primary_key=True, index=True)

    snapshot_date = Column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        server_default=func.now(),
    )

    academic_year = Column(
        String(20),
        nullable=True,
        index=True,
    )

    # Student metrics
    active_students = Column(
        Integer,
        nullable=False,
        default=0,
    )

    inactive_students = Column(
        Integer,
        nullable=False,
        default=0,
    )

    # Admission metrics
    total_admissions = Column(
        Integer,
        nullable=False,
        default=0,
    )

    pending_admissions = Column(
        Integer,
        nullable=False,
        default=0,
    )

    enrolled_admissions = Column(
        Integer,
        nullable=False,
        default=0,
    )

    # Financial metrics
    total_fee_due = Column(
        Numeric(14, 2),
        nullable=False,
        default=0,
    )

    total_fee_paid = Column(
        Numeric(14, 2),
        nullable=False,
        default=0,
    )

    total_fee_outstanding = Column(
        Numeric(14, 2),
        nullable=False,
        default=0,
    )

    fee_collection_rate = Column(
        Numeric(8, 2),
        nullable=False,
        default=0,
    )

    # Metadata
    snapshot_type = Column(
        String(30),
        nullable=False,
        default="DAILY",
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )