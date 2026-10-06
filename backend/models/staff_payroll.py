from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Numeric,
    Text,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from database import Base


class StaffPayroll(Base):
    __tablename__ = "staff_payroll"

    # ==========================================
    # PRIMARY KEY
    # ==========================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ==========================================
    # STAFF
    # ==========================================

    staff_id = Column(
        Integer,
        ForeignKey("staff.id"),
        nullable=False,
        index=True,
    )

    # ==========================================
    # PAYROLL PERIOD
    # ==========================================

    payroll_month = Column(
        Integer,
        nullable=False,
        index=True,
    )

    payroll_year = Column(
        Integer,
        nullable=False,
        index=True,
    )

    pay_date = Column(
        Date,
        nullable=True,
        index=True,
    )

    # ==========================================
    # ATTENDANCE / WORKING DAYS
    # ==========================================

    total_working_days = Column(
        Numeric(6, 2),
        nullable=False,
        default=0,
    )

    days_present = Column(
        Numeric(6, 2),
        nullable=False,
        default=0,
    )

    days_absent = Column(
        Numeric(6, 2),
        nullable=False,
        default=0,
    )

    days_on_leave = Column(
        Numeric(6, 2),
        nullable=False,
        default=0,
    )

    half_days = Column(
        Numeric(6, 2),
        nullable=False,
        default=0,
    )

    loss_of_pay_days = Column(
        Numeric(6, 2),
        nullable=False,
        default=0,
    )

    # ==========================================
    # SALARY STRUCTURE
    # ==========================================

    basic_salary = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    allowances = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    deductions = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    # ==========================================
    # ATTENDANCE / LOP ADJUSTMENTS
    # ==========================================

    loss_of_pay_amount = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    overtime_amount = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    bonus_amount = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    # ==========================================
    # GROSS & NET SALARY
    # ==========================================

    gross_salary = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    total_deductions = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    net_salary = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    # ==========================================
    # PAYROLL STATUS
    # ==========================================

    status = Column(
        String(30),
        nullable=False,
        default="DRAFT",
        index=True,
    )

    # Possible statuses:
    #
    # DRAFT
    # PROCESSED
    # APPROVED
    # PAID
    # CANCELLED

    # ==========================================
    # PAYMENT INFORMATION
    # ==========================================

    payment_method = Column(
        String(30),
        nullable=True,
    )

    payment_reference = Column(
        String(100),
        nullable=True,
    )

    payment_date = Column(
        Date,
        nullable=True,
    )

    # ==========================================
    # APPROVAL
    # ==========================================

    approved_by = Column(
        Integer,
        nullable=True,
    )

    approved_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ==========================================
    # NOTES
    # ==========================================

    remarks = Column(
        Text,
        nullable=True,
    )

    # ==========================================
    # AUDIT FIELDS
    # ==========================================

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

    # ==========================================
    # CONSTRAINTS
    # ==========================================

    __table_args__ = (
        UniqueConstraint(
            "staff_id",
            "payroll_month",
            "payroll_year",
            name="uq_staff_payroll_staff_month_year",
        ),
    )