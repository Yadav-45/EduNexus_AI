from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func

from database import Base


class TransportRoute(Base):
    __tablename__ = "transport_routes"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    route_name = Column(
        String(150),
        nullable=False,
        index=True,
    )

    route_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    start_point = Column(
        String(200),
        nullable=False,
    )

    end_point = Column(
        String(200),
        nullable=False,
    )

    pickup_points = Column(
        Text,
        nullable=True,
    )

    distance_km = Column(
        String(30),
        nullable=True,
    )

    estimated_duration_minutes = Column(
        Integer,
        nullable=True,
    )

    vehicle_id = Column(
        Integer,
        ForeignKey(
            "transport_vehicles.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    driver_id = Column(
        Integer,
        ForeignKey(
            "transport_drivers.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="ACTIVE",
        index=True,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
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
            "ix_transport_route_status_active",
            "status",
            "is_active",
        ),
        Index(
            "ix_transport_route_vehicle_driver",
            "vehicle_id",
            "driver_id",
        ),
    )