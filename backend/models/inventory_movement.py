from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.sql import func

from database import Base


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    movement_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    item_id = Column(
        Integer,
        ForeignKey(
            "inventory_items.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    movement_type = Column(
        String(30),
        nullable=False,
        index=True,
    )

    quantity = Column(
        Numeric(14, 3),
        nullable=False,
    )

    unit_cost = Column(
        Numeric(14, 2),
        nullable=False,
        default=0,
    )

    total_value = Column(
        Numeric(14, 2),
        nullable=False,
        default=0,
    )

    reference_number = Column(
        String(100),
        nullable=True,
        index=True,
    )

    supplier_id = Column(
        Integer,
        ForeignKey(
            "inventory_suppliers.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    performed_by = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    remarks = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        Index(
            "ix_inventory_movement_item_date",
            "item_id",
            "created_at",
        ),
        Index(
            "ix_inventory_movement_type_date",
            "movement_type",
            "created_at",
        ),
        Index(
            "ix_inventory_movement_supplier_date",
            "supplier_id",
            "created_at",
        ),
    )