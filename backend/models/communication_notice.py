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


class CommunicationNotice(Base):
    __tablename__ = "communication_notices"

    id = Column(Integer, primary_key=True, index=True)

    notice_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    title = Column(
        String(255),
        nullable=False,
        index=True,
    )

    message = Column(
        Text,
        nullable=False,
    )

    notice_type = Column(
        String(50),
        nullable=False,
        default="GENERAL",
        index=True,
    )

    priority = Column(
        String(30),
        nullable=False,
        default="NORMAL",
        index=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="DRAFT",
        index=True,
    )

    target_type = Column(
        String(50),
        nullable=False,
        default="ALL",
        index=True,
    )

    target_class = Column(
        String(100),
        nullable=True,
        index=True,
    )

    target_section = Column(
        String(50),
        nullable=True,
        index=True,
    )

    publish_at = Column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    published_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    published_at = Column(
        DateTime(timezone=True),
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
            "ix_communication_notice_status_publish",
            "status",
            "publish_at",
        ),
        Index(
            "ix_communication_notice_target",
            "target_type",
            "target_class",
            "target_section",
        ),
        Index(
            "ix_communication_notice_active_created",
            "is_active",
            "created_at",
        ),
    )