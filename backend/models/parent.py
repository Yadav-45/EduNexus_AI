from sqlalchemy import Column, ForeignKey, Integer, String, Text
from database import Base


class Parent(Base):
    __tablename__ = "parents"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=True,
    )

    first_name = Column(
        String(100),
        nullable=False,
    )

    last_name = Column(
        String(100),
        nullable=True,
    )

    relationship = Column(
        String(50),
        nullable=True,
    )

    phone = Column(
        String(30),
        nullable=True,
    )

    alternate_phone = Column(
        String(30),
        nullable=True,
    )

    email = Column(
        String(150),
        nullable=True,
    )

    address = Column(
        Text,
        nullable=True,
    )

    occupation = Column(
        String(100),
        nullable=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="ACTIVE",
    )