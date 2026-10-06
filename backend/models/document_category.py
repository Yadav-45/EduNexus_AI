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


class DocumentCategory(Base):
    __tablename__ = "document_categories"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    category_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    category_name = Column(
        String(150),
        nullable=False,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    applies_to = Column(
        String(50),
        nullable=False,
        default="ALL",
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
            "ix_document_category_active_name",
            "is_active",
            "category_name",
        ),
        Index(
            "ix_document_category_applies_status",
            "applies_to",
            "status",
        ),
    )