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


class PayrollPayslip(Base):
    __tablename__ = "payroll_payslips"

    id = Column(Integer, primary_key=True, index=True)

    payroll_id = Column(
        Integer,
        ForeignKey("staff_payroll.id"),
        nullable=False,
        index=True,
    )

    staff_id = Column(
        Integer,
        ForeignKey("staff.id"),
        nullable=False,
        index=True,
    )

    payslip_number = Column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )

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
    )

    # Attendance
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

    # Earnings
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

    gross_salary = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    # Deductions
    loss_of_pay_amount = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    other_deductions = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    total_deductions = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    # Final salary
    net_salary = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    # Payment
    payment_status = Column(
        String(30),
        nullable=False,
        default="PENDING",
        index=True,
    )

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

    remarks = Column(
        Text,
        nullable=True,
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

    __table_args__ = (
        UniqueConstraint(
            "payroll_id",
            name="uq_payroll_payslip_payroll",
        ),
    )