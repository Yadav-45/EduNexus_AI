from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# BASE
# ============================================================

class PayrollPayslipBase(BaseModel):
    payroll_id: int
    staff_id: int

    payroll_month: int = Field(
        ...,
        ge=1,
        le=12,
    )

    payroll_year: int = Field(
        ...,
        ge=2000,
        le=2100,
    )

    pay_date: Optional[date] = None

    # --------------------------------------------------------
    # Attendance
    # --------------------------------------------------------

    total_working_days: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    days_present: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    days_absent: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    days_on_leave: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    half_days: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    loss_of_pay_days: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    # --------------------------------------------------------
    # Earnings
    # --------------------------------------------------------

    basic_salary: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    allowances: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    overtime_amount: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    bonus_amount: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    gross_salary: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    # --------------------------------------------------------
    # Deductions
    # --------------------------------------------------------

    loss_of_pay_amount: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    other_deductions: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    total_deductions: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    # --------------------------------------------------------
    # Final Salary
    # --------------------------------------------------------

    net_salary: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    # --------------------------------------------------------
    # Payment
    # --------------------------------------------------------

    payment_status: str = Field(
        default="PENDING",
        max_length=30,
    )

    payment_method: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    payment_reference: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    payment_date: Optional[date] = None

    remarks: Optional[str] = None


# ============================================================
# CREATE
# ============================================================

class PayrollPayslipCreate(PayrollPayslipBase):
    pass


# ============================================================
# UPDATE
# ============================================================

class PayrollPayslipUpdate(BaseModel):
    pay_date: Optional[date] = None

    payment_status: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    payment_method: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    payment_reference: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    payment_date: Optional[date] = None

    remarks: Optional[str] = None


# ============================================================
# RESPONSE
# ============================================================

class PayrollPayslipResponse(PayrollPayslipBase):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    payslip_number: str

    created_at: datetime
    updated_at: datetime


# ============================================================
# LIST ITEM
# ============================================================

class PayrollPayslipListItem(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    payroll_id: int
    staff_id: int

    payslip_number: str

    payroll_month: int
    payroll_year: int

    pay_date: Optional[date] = None

    basic_salary: Decimal
    allowances: Decimal
    overtime_amount: Decimal
    bonus_amount: Decimal

    gross_salary: Decimal

    loss_of_pay_amount: Decimal
    other_deductions: Decimal
    total_deductions: Decimal

    net_salary: Decimal

    payment_status: str

    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    payment_date: Optional[date] = None

    # Staff information
    staff_code: Optional[str] = None
    staff_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None


# ============================================================
# LIST RESPONSE
# ============================================================

class PayrollPayslipListResponse(BaseModel):
    items: List[PayrollPayslipListItem]

    total: int

    page: int

    page_size: int

    total_pages: int


# ============================================================
# PAYSLIP SUMMARY
# ============================================================

class PayrollPayslipSummary(BaseModel):
    payroll_month: int
    payroll_year: int

    total_payslips: int

    pending_payslips: int

    paid_payslips: int

    total_gross_salary: Decimal

    total_deductions: Decimal

    total_net_salary: Decimal

    total_paid_amount: Decimal

    total_pending_amount: Decimal


# ============================================================
# PAYSLIP GENERATION RESPONSE
# ============================================================

class PayslipGenerationResponse(BaseModel):
    message: str

    payslip_id: int

    payslip_number: str

    payroll_id: int

    staff_id: int

    payroll_month: int

    payroll_year: int

    payment_status: str


# ============================================================
# PAYMENT UPDATE
# ============================================================

class PayslipPayment(BaseModel):
    payment_method: str = Field(
        ...,
        max_length=30,
    )

    payment_reference: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    payment_date: Optional[date] = None

    remarks: Optional[str] = None


# ============================================================
# REPORT RESPONSE
# ============================================================

class PayrollReportItem(BaseModel):
    staff_id: int

    staff_code: Optional[str] = None

    staff_name: Optional[str] = None

    department: Optional[str] = None

    designation: Optional[str] = None

    payroll_month: int

    payroll_year: int

    total_working_days: Decimal

    days_present: Decimal

    days_absent: Decimal

    days_on_leave: Decimal

    half_days: Decimal

    loss_of_pay_days: Decimal

    basic_salary: Decimal

    allowances: Decimal

    overtime_amount: Decimal

    bonus_amount: Decimal

    gross_salary: Decimal

    loss_of_pay_amount: Decimal

    other_deductions: Decimal

    total_deductions: Decimal

    net_salary: Decimal

    payment_status: str


class PayrollReportResponse(BaseModel):
    payroll_month: int

    payroll_year: int

    total_staff: int

    total_working_days: Decimal

    total_present_days: Decimal

    total_absent_days: Decimal

    total_leave_days: Decimal

    total_gross_salary: Decimal

    total_deductions: Decimal

    total_net_salary: Decimal

    total_paid_amount: Decimal

    total_pending_amount: Decimal

    items: List[PayrollReportItem]