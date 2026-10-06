from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func

from database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    document_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    category_id = Column(
        Integer,
        ForeignKey(
            "document_categories.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    title = Column(
        String(255),
        nullable=False,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    entity_type = Column(
        String(50),
        nullable=False,
        index=True,
    )

    entity_id = Column(
        Integer,
        nullable=True,
        index=True,
    )

    file_name = Column(
        String(255),
        nullable=False,
    )

    original_file_name = Column(
        String(255),
        nullable=False,
    )

    file_path = Column(
        String(500),
        nullable=False,
    )

    file_extension = Column(
        String(20),
        nullable=False,
        index=True,
    )

    mime_type = Column(
        String(100),
        nullable=False,
    )

    file_size = Column(
        BigInteger,
        nullable=False,
    )

    document_date = Column(
        Date,
        nullable=True,
        index=True,
    )

    expiry_date = Column(
        Date,
        nullable=True,
        index=True,
    )

    verification_status = Column(
        String(30),
        nullable=False,
        default="PENDING",
        index=True,
    )

    verified_by = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    verified_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    is_confidential = Column(
        Boolean,
        nullable=False,
        default=False,
        index=True,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
    )

    uploaded_by = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
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
            "ix_documents_entity",
            "entity_type",
            "entity_id",
        ),
        Index(
            "ix_documents_category_active",
            "category_id",
            "is_active",
        ),
        Index(
            "ix_documents_expiry_active",
            "expiry_date",
            "is_active",
        ),
        Index(
            "ix_documents_verification_active",
            "verification_status",
            "is_active",
        ),
        Index(
            "ix_documents_entity_category",
            "entity_type",
            "entity_id",
            "category_id",
        ),
    )