from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func

from database import Base


class InventorySupplier(Base):
    __tablename__ = "inventory_suppliers"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    supplier_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    supplier_name = Column(
        String(200),
        nullable=False,
        index=True,
    )

    contact_person = Column(
        String(150),
        nullable=True,
    )

    phone = Column(
        String(30),
        nullable=True,
        index=True,
    )

    alternate_phone = Column(
        String(30),
        nullable=True,
    )

    email = Column(
        String(150),
        nullable=True,
        index=True,
    )

    address = Column(
        Text,
        nullable=True,
    )

    pan_number = Column(
        String(100),
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
            "ix_inventory_supplier_status_active",
            "status",
            "is_active",
        ),
    )