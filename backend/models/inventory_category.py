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


class InventoryCategory(Base):
    __tablename__ = "inventory_categories"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
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
            "ix_inventory_category_status_active",
            "status",
            "is_active",
        ),
    )