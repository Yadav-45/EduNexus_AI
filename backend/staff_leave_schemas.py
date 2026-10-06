from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# =====================================================
# BASE
# =====================================================

class StaffLeaveBase(BaseModel):
    staff_id: int = Field(
        ...,
        gt=0,
    )

    leave_type: str = Field(
        ...,
        min_length=2,
        max_length=50,
    )

    start_date: date

    end_date: date

    reason: Optional[str] = None


# =====================================================
# CREATE
# =====================================================

class StaffLeaveCreate(StaffLeaveBase):
    pass


# =====================================================
# UPDATE
# =====================================================

class StaffLeaveUpdate(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    leave_type: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=50,
    )

    start_date: Optional[date] = None

    end_date: Optional[date] = None

    reason: Optional[str] = None

    status: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    approval_remarks: Optional[str] = None


# =====================================================
# RESPONSE
# =====================================================

class StaffLeaveResponse(StaffLeaveBase):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    total_days: Decimal

    status: str

    approval_remarks: Optional[str] = None

    approved_by: Optional[int] = None

    approved_at: Optional[datetime] = None

    created_at: datetime

    updated_at: datetime


# =====================================================
# LIST ITEM
# =====================================================

class StaffLeaveListItem(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    staff_id: int

    leave_type: str

    start_date: date

    end_date: date

    total_days: Decimal

    reason: Optional[str] = None

    status: str

    approval_remarks: Optional[str] = None

    approved_by: Optional[int] = None

    approved_at: Optional[datetime] = None

    created_at: datetime

    updated_at: datetime

    staff_code: Optional[str] = None

    staff_name: Optional[str] = None

    department: Optional[str] = None

    designation: Optional[str] = None


# =====================================================
# LIST RESPONSE
# =====================================================

class StaffLeaveListResponse(BaseModel):
    items: list[StaffLeaveListItem]

    total: int

    page: int

    page_size: int

    pages: int


# =====================================================
# SUMMARY
# =====================================================

class StaffLeaveSummary(BaseModel):
    total_requests: int

    pending: int

    approved: int

    rejected: int

    cancelled: int

    total_leave_days: Decimal