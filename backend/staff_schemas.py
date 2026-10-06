from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ============================================================
# BASE SCHEMA
# ============================================================

class StaffBase(BaseModel):
    # --------------------------------------------------------
    # BASIC INFORMATION
    # --------------------------------------------------------

    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)

    gender: Optional[str] = Field(default=None, max_length=20)
    date_of_birth: Optional[date] = None

    # --------------------------------------------------------
    # CONTACT INFORMATION
    # --------------------------------------------------------

    phone: Optional[str] = Field(default=None, max_length=30)

    email: Optional[EmailStr] = None

    address: Optional[str] = None
    city: Optional[str] = Field(default=None, max_length=100)
    state: Optional[str] = Field(default=None, max_length=100)
    postal_code: Optional[str] = Field(default=None, max_length=20)

    # --------------------------------------------------------
    # EMERGENCY CONTACT
    # --------------------------------------------------------

    emergency_contact_name: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    emergency_contact_phone: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    emergency_contact_relation: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    # --------------------------------------------------------
    # EMPLOYMENT INFORMATION
    # --------------------------------------------------------

    joining_date: Optional[date] = None

    department: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    designation: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    employment_type: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    qualification: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    experience_years: Optional[Decimal] = Field(
        default=None,
        ge=0,
        le=99.99,
    )

    # --------------------------------------------------------
    # SALARY INFORMATION
    # --------------------------------------------------------

    basic_salary: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    allowances: Optional[Decimal] = Field(
        default=Decimal("0.00"),
        ge=0,
    )

    deductions: Optional[Decimal] = Field(
        default=Decimal("0.00"),
        ge=0,
    )

    # --------------------------------------------------------
    # BANK / PAYMENT INFORMATION
    # --------------------------------------------------------

    bank_name: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    bank_account_number: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    bank_ifsc: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    status: str = Field(
        default="ACTIVE",
        max_length=30,
    )

    # --------------------------------------------------------
    # ADDITIONAL INFORMATION
    # --------------------------------------------------------

    notes: Optional[str] = None


# ============================================================
# CREATE STAFF
# ============================================================

class StaffCreate(StaffBase):
    staff_id: Optional[str] = Field(
        default=None,
        max_length=50,
    )


# ============================================================
# UPDATE STAFF
# ============================================================

class StaffUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    first_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    last_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    gender: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    date_of_birth: Optional[date] = None

    phone: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    email: Optional[EmailStr] = None

    address: Optional[str] = None
    city: Optional[str] = Field(default=None, max_length=100)
    state: Optional[str] = Field(default=None, max_length=100)
    postal_code: Optional[str] = Field(default=None, max_length=20)

    emergency_contact_name: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    emergency_contact_phone: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    emergency_contact_relation: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    joining_date: Optional[date] = None

    department: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    designation: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    employment_type: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    qualification: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    experience_years: Optional[Decimal] = Field(
        default=None,
        ge=0,
        le=99.99,
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

    bank_name: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    bank_account_number: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    bank_ifsc: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    status: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    notes: Optional[str] = None


# ============================================================
# STAFF RESPONSE
# ============================================================

class StaffResponse(StaffBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    staff_id: str

    is_deleted: bool

    created_at: datetime
    updated_at: datetime


# ============================================================
# STAFF LIST RESPONSE
# ============================================================

class StaffListResponse(BaseModel):
    items: list[StaffResponse]
    total: int
    page: int
    page_size: int
    pages: int