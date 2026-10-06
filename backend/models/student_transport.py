from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Numeric,
    Text,
    Boolean,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from database import Base


class StudentTransport(Base):
    __tablename__ = "student_transport"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # STUDENT
    # ============================================================

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # TRANSPORT ROUTE
    # ============================================================

    route_id = Column(
        Integer,
        ForeignKey("transport_routes.id"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # PICKUP / DROP POINTS
    # ============================================================

    pickup_point = Column(
        String(200),
        nullable=True,
    )

    drop_point = Column(
        String(200),
        nullable=True,
    )

    # ============================================================
    # TRANSPORT FEE
    # ============================================================

    transport_fee = Column(
        Numeric(12, 2),
        nullable=True,
    )

    # ============================================================
    # TRANSPORT PERIOD
    # ============================================================

    start_date = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    end_date = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ============================================================
    # STATUS
    # ============================================================

    status = Column(
        String(30),
        nullable=False,
        default="ACTIVE",
        index=True,
    )

    # ============================================================
    # ACTIVE FLAG
    # ============================================================

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    # ============================================================
    # NOTES
    # ============================================================

    notes = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # CREATED / UPDATED
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
            "student_id",
            name="uq_student_transport_student",
        ),
    )