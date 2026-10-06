from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# =====================================================
# BASE SCHEMA
# =====================================================

class StaffPayrollBase(BaseModel):
    staff_id: int = Field(
        ...,
        gt=0,
    )

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

    # ==========================================
    # ATTENDANCE
    # ==========================================

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

    # ==========================================
    # SALARY
    # ==========================================

    basic_salary: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    allowances: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    deductions: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    # ==========================================
    # ADJUSTMENTS
    # ==========================================

    loss_of_pay_amount: Decimal = Field(
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

    # ==========================================
    # TOTALS
    # ==========================================

    gross_salary: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    total_deductions: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    net_salary: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    # ==========================================
    # PAYMENT
    # ==========================================

    payment_method: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    payment_reference: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    payment_date: Optional[date] = None

    # ==========================================
    # REMARKS
    # ==========================================

    remarks: Optional[str] = None


# =====================================================
# CREATE
# =====================================================

class StaffPayrollCreate(BaseModel):
    staff_id: int = Field(
        ...,
        gt=0,
    )

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

    # Attendance
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

    # Salary
    basic_salary: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    allowances: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    deductions: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    # Adjustments
    loss_of_pay_amount: Decimal = Field(
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


# =====================================================
# UPDATE
# =====================================================

class StaffPayrollUpdate(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    pay_date: Optional[date] = None

    total_working_days: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    days_present: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    days_absent: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    days_on_leave: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    half_days: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    loss_of_pay_days: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    basic_salary: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    allowances: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    deductions: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    loss_of_pay_amount: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    overtime_amount: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    bonus_amount: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    gross_salary: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    total_deductions: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    net_salary: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    status: Optional[str] = Field(
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


# =====================================================
# RESPONSE
# =====================================================

class StaffPayrollResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    staff_id: int

    payroll_month: int

    payroll_year: int

    pay_date: Optional[date] = None

    # Attendance
    total_working_days: Decimal

    days_present: Decimal

    days_absent: Decimal

    days_on_leave: Decimal

    half_days: Decimal

    loss_of_pay_days: Decimal

    # Salary
    basic_salary: Decimal

    allowances: Decimal

    deductions: Decimal

    # Adjustments
    loss_of_pay_amount: Decimal

    overtime_amount: Decimal

    bonus_amount: Decimal

    # Totals
    gross_salary: Decimal

    total_deductions: Decimal

    net_salary: Decimal

    # Status
    status: str

    # Payment
    payment_method: Optional[str] = None

    payment_reference: Optional[str] = None

    payment_date: Optional[date] = None

    # Approval
    approved_by: Optional[int] = None

    approved_at: Optional[datetime] = None

    # Remarks
    remarks: Optional[str] = None

    # Audit
    created_at: datetime

    updated_at: datetime


# =====================================================
# LIST ITEM
# =====================================================

class StaffPayrollListItem(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    staff_id: int

    payroll_month: int

    payroll_year: int

    pay_date: Optional[date] = None

    basic_salary: Decimal

    allowances: Decimal

    deductions: Decimal

    loss_of_pay_amount: Decimal

    overtime_amount: Decimal

    bonus_amount: Decimal

    gross_salary: Decimal

    total_deductions: Decimal

    net_salary: Decimal

    status: str

    payment_method: Optional[str] = None

    payment_reference: Optional[str] = None

    payment_date: Optional[date] = None

    remarks: Optional[str] = None

    created_at: datetime

    updated_at: datetime

    # ==========================================
    # STAFF INFORMATION
    # ==========================================

    staff_code: Optional[str] = None

    staff_name: Optional[str] = None

    department: Optional[str] = None

    designation: Optional[str] = None


# =====================================================
# LIST RESPONSE
# =====================================================

class StaffPayrollListResponse(BaseModel):
    items: list[StaffPayrollListItem]

    total: int

    page: int

    page_size: int

    pages: int


# =====================================================
# PAYROLL SUMMARY
# =====================================================

class StaffPayrollSummary(BaseModel):
    payroll_month: int

    payroll_year: int

    total_staff: int

    total_payroll_records: int

    draft: int

    processed: int

    approved: int

    paid: int

    cancelled: int

    total_gross_salary: Decimal

    total_deductions: Decimal

    total_net_salary: Decimal


# =====================================================
# PAYROLL APPROVAL
# =====================================================

class StaffPayrollApproval(BaseModel):
    approval_remarks: Optional[str] = None


# =====================================================
# PAYROLL PAYMENT
# =====================================================

class StaffPayrollPayment(BaseModel):
    payment_method: str = Field(
        ...,
        min_length=2,
        max_length=30,
    )

    payment_reference: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    payment_date: Optional[date] = None

    remarks: Optional[str] = None