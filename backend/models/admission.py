from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from sqlalchemy.sql import func

from database import Base


class Admission(Base):
    __tablename__ = "admissions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    application_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    # Student information
    first_name = Column(
        String(100),
        nullable=False,
        index=True,
    )

    last_name = Column(
        String(100),
        nullable=True,
        index=True,
    )

    date_of_birth = Column(
        Date,
        nullable=False,
    )

    gender = Column(
        String(20),
        nullable=True,
    )

    phone = Column(
        String(20),
        nullable=True,
        index=True,
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

    # Academic information
    applying_for_class = Column(
        String(50),
        nullable=False,
        index=True,
    )

    academic_year = Column(
        String(20),
        nullable=False,
        index=True,
    )

    previous_school = Column(
        String(200),
        nullable=True,
    )

    # Parent / guardian information
    parent_name = Column(
        String(150),
        nullable=False,
    )

    parent_phone = Column(
        String(20),
        nullable=False,
        index=True,
    )

    parent_email = Column(
        String(150),
        nullable=True,
    )

    parent_occupation = Column(
        String(150),
        nullable=True,
    )

    # Admission workflow
    status = Column(
        String(30),
        nullable=False,
        default="APPLIED",
        index=True,
    )

    remarks = Column(
        Text,
        nullable=True,
    )

    # When application was submitted
    application_date = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )