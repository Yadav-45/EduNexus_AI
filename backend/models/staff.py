from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Numeric,
    Text,
    Boolean,
)
from sqlalchemy.sql import func

from database import Base


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)

    # --------------------------------------------------
    # BASIC INFORMATION
    # --------------------------------------------------

    staff_id = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    first_name = Column(
        String(100),
        nullable=False,
    )

    last_name = Column(
        String(100),
        nullable=False,
    )

    gender = Column(
        String(20),
        nullable=True,
    )

    date_of_birth = Column(
        Date,
        nullable=True,
    )

    # --------------------------------------------------
    # CONTACT INFORMATION
    # --------------------------------------------------

    phone = Column(
        String(30),
        nullable=True,
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

    city = Column(
        String(100),
        nullable=True,
    )

    state = Column(
        String(100),
        nullable=True,
    )

    postal_code = Column(
        String(20),
        nullable=True,
    )

    # --------------------------------------------------
    # EMERGENCY CONTACT
    # --------------------------------------------------

    emergency_contact_name = Column(
        String(150),
        nullable=True,
    )

    emergency_contact_phone = Column(
        String(30),
        nullable=True,
    )

    emergency_contact_relation = Column(
        String(50),
        nullable=True,
    )

    # --------------------------------------------------
    # EMPLOYMENT INFORMATION
    # --------------------------------------------------

    joining_date = Column(
        Date,
        nullable=True,
    )

    department = Column(
        String(100),
        nullable=True,
        index=True,
    )

    designation = Column(
        String(100),
        nullable=True,
        index=True,
    )

    employment_type = Column(
        String(50),
        nullable=True,
    )

    qualification = Column(
        String(255),
        nullable=True,
    )

    experience_years = Column(
        Numeric(5, 2),
        nullable=True,
    )

    # --------------------------------------------------
    # SALARY INFORMATION
    # --------------------------------------------------

    basic_salary = Column(
        Numeric(12, 2),
        nullable=True,
    )

    allowances = Column(
        Numeric(12, 2),
        nullable=True,
        default=0,
    )

    deductions = Column(
        Numeric(12, 2),
        nullable=True,
        default=0,
    )

    # --------------------------------------------------
    # BANK / PAYMENT INFORMATION
    # --------------------------------------------------

    bank_name = Column(
        String(150),
        nullable=True,
    )

    bank_account_number = Column(
        String(100),
        nullable=True,
    )

    bank_ifsc = Column(
        String(50),
        nullable=True,
    )

    # --------------------------------------------------
    # STATUS
    # --------------------------------------------------

    status = Column(
        String(30),
        nullable=False,
        default="ACTIVE",
        index=True,
    )

    # --------------------------------------------------
    # ADDITIONAL INFORMATION
    # --------------------------------------------------

    notes = Column(
        Text,
        nullable=True,
    )

    # --------------------------------------------------
    # SYSTEM FIELDS
    # --------------------------------------------------

    is_deleted = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    created_at = Column(
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