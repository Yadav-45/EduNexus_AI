from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)

from database import Base


class FeeStructure(Base):
    __tablename__ = "fee_structures"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(150),
        nullable=False,
    )

    academic_year = Column(
        String(20),
        nullable=False,
        index=True,
    )

    class_name = Column(
        String(100),
        nullable=False,
        index=True,
    )

    admission_fee = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    tuition_fee = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    transport_fee = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    examination_fee = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    activity_fee = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    other_fee = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    total_fee = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    description = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="ACTIVE",
        index=True,
    )

    __table_args__ = (
        UniqueConstraint(
            "academic_year",
            "class_name",
            "name",
            name="uq_fee_structure",
        ),
    )