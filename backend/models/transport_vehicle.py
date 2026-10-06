from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func

from database import Base


class TransportVehicle(Base):
    __tablename__ = "transport_vehicles"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    vehicle_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    vehicle_type = Column(
        String(50),
        nullable=False,
        index=True,
    )

    make_model = Column(
        String(150),
        nullable=True,
    )

    capacity = Column(
        Integer,
        nullable=False,
    )

    registration_number = Column(
        String(100),
        nullable=True,
        unique=True,
        index=True,
    )

    registration_expiry = Column(
        Date,
        nullable=True,
        index=True,
    )

    insurance_number = Column(
        String(100),
        nullable=True,
        index=True,
    )

    insurance_expiry = Column(
        Date,
        nullable=True,
        index=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="ACTIVE",
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    __table_args__ = (
        Index(
            "ix_transport_vehicle_status_active",
            "status",
            "is_active",
        ),
        Index(
            "ix_transport_vehicle_registration_expiry",
            "registration_expiry",
        ),
        Index(
            "ix_transport_vehicle_insurance_expiry",
            "insurance_expiry",
        ),
    )