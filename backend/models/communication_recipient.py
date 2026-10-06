from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from database import Base


class CommunicationRecipient(Base):
    __tablename__ = "communication_recipients"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    notice_id = Column(
        Integer,
        ForeignKey(
            "communication_notices.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    recipient_user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    recipient_role = Column(
        String(50),
        nullable=True,
        index=True,
    )

    delivery_status = Column(
        String(30),
        nullable=False,
        default="PENDING",
        index=True,
    )

    sent_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    delivered_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    read_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    is_read = Column(
        Boolean,
        nullable=False,
        default=False,
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
        UniqueConstraint(
            "notice_id",
            "recipient_user_id",
            name="uq_communication_notice_recipient",
        ),
        Index(
            "ix_communication_recipient_notice_status",
            "notice_id",
            "delivery_status",
        ),
        Index(
            "ix_communication_recipient_user_read",
            "recipient_user_id",
            "is_read",
        ),
    )