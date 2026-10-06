from sqlalchemy import Boolean, Column, Integer, String, Text

from database import Base


class FeeNotificationTemplate(Base):
    __tablename__ = "fee_notification_templates"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False, unique=True, index=True)

    notification_type = Column(
        String(50),
        nullable=False,
        index=True,
    )

    channel = Column(
        String(30),
        nullable=False,
        default="IN_APP",
    )

    subject = Column(
        String(250),
        nullable=True,
    )

    message_template = Column(
        Text,
        nullable=False,
    )

    status = Column(
        String(30),
        nullable=False,
        default="ACTIVE",
        index=True,
    )

    is_default = Column(
        Boolean,
        nullable=False,
        default=False,
    )