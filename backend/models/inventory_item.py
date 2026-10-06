from datetime import datetime

from sqlalchemy import (
    Boolean,
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


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    item_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    item_name = Column(
        String(200),
        nullable=False,
        index=True,
    )

    category_id = Column(
        Integer,
        ForeignKey(
            "inventory_categories.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    subcategory = Column(
        String(100),
        nullable=True,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    unit = Column(
        String(30),
        nullable=False,
    )

    current_quantity = Column(
        Numeric(14, 3),
        nullable=False,
        default=0,
    )

    minimum_stock_level = Column(
        Numeric(14, 3),
        nullable=False,
        default=0,
    )

    maximum_stock_level = Column(
        Numeric(14, 3),
        nullable=True,
    )

    unit_cost = Column(
        Numeric(14, 2),
        nullable=False,
        default=0,
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

    storage_location = Column(
        String(150),
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
            "ix_inventory_item_category_status",
            "category_id",
            "status",
        ),
        Index(
            "ix_inventory_item_supplier_status",
            "supplier_id",
            "status",
        ),
        Index(
            "ix_inventory_item_active_status",
            "is_active",
            "status",
        ),
        Index(
            "ix_inventory_item_low_stock",
            "current_quantity",
            "minimum_stock_level",
        ),
    )