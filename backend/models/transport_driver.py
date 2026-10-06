from datetime import datetime, date

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


class TransportDriver(Base):
    __tablename__ = "transport_drivers"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    full_name = Column(
        String(200),
        nullable=False,
        index=True,
    )

    phone = Column(
        String(30),
        nullable=False,
        index=True,
    )

    alternate_phone = Column(
        String(30),
        nullable=True,
    )

    license_number = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    license_type = Column(
        String(50),
        nullable=True,
    )

    license_expiry = Column(
        Date,
        nullable=True,
        index=True,
    )

    address = Column(
        Text,
        nullable=True,
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
            "ix_transport_driver_status_active",
            "status",
            "is_active",
        ),
        Index(
            "ix_transport_driver_license_expiry",
            "license_expiry",
        ),
    )