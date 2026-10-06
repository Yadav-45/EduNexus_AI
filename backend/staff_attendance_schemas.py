from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# BASE SCHEMA
# ============================================================

class StaffAttendanceBase(BaseModel):
    staff_id: int = Field(
        ...,
        gt=0,
    )

    attendance_date: date

    status: str = Field(
        default="PRESENT",
        max_length=30,
    )

    check_in: Optional[time] = None

    check_out: Optional[time] = None

    working_hours: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    remarks: Optional[str] = None


# ============================================================
# CREATE ATTENDANCE
# ============================================================

class StaffAttendanceCreate(
    StaffAttendanceBase
):
    pass


# ============================================================
# UPDATE ATTENDANCE
# ============================================================

class StaffAttendanceUpdate(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    status: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    check_in: Optional[time] = None

    check_out: Optional[time] = None

    working_hours: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    remarks: Optional[str] = None


# ============================================================
# RESPONSE
# ============================================================

class StaffAttendanceResponse(
    StaffAttendanceBase
):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    created_at: datetime

    updated_at: datetime


# ============================================================
# STAFF ATTENDANCE WITH STAFF DETAILS
# ============================================================

class StaffAttendanceListItem(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    staff_id: int

    attendance_date: date

    status: str

    check_in: Optional[time] = None

    check_out: Optional[time] = None

    working_hours: Optional[str] = None

    remarks: Optional[str] = None

    created_at: datetime

    updated_at: datetime

    # Staff information returned by the router

    staff_code: Optional[str] = None

    staff_name: Optional[str] = None

    department: Optional[str] = None

    designation: Optional[str] = None


# ============================================================
# PAGINATED RESPONSE
# ============================================================

class StaffAttendanceListResponse(BaseModel):
    items: list[StaffAttendanceListItem]

    total: int

    page: int

    page_size: int

    pages: int


# ============================================================
# DAILY SUMMARY
# ============================================================

class StaffAttendanceSummary(BaseModel):
    date: date

    total_staff: int

    present: int

    absent: int

    half_day: int

    late: int

    on_leave: int

    holiday: int

    week_off: int