from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# BASE SCHEMA
# ============================================================

class ExamBase(BaseModel):
    exam_name: str = Field(..., min_length=1, max_length=150)
    exam_type: str = Field(default="TERM", max_length=50)
    academic_year: str = Field(..., min_length=1, max_length=20)
    term: Optional[str] = Field(default=None, max_length=50)
    description: Optional[str] = None

    class_name: str = Field(..., min_length=1, max_length=50)
    section: Optional[str] = Field(default=None, max_length=20)

    subject_name: str = Field(..., min_length=1, max_length=100)
    subject_code: Optional[str] = Field(default=None, max_length=50)

    exam_date: date
    start_time: Optional[str] = Field(default=None, max_length=20)
    end_time: Optional[str] = Field(default=None, max_length=20)
    duration_minutes: Optional[int] = Field(default=None, ge=1)
    room_number: Optional[str] = Field(default=None, max_length=50)

    maximum_marks: Decimal = Field(default=Decimal("100"), ge=0)
    passing_marks: Decimal = Field(default=Decimal("33"), ge=0)

    status: str = Field(default="SCHEDULED", max_length=30)
    is_published: bool = False

    instructions: Optional[str] = None
    remarks: Optional[str] = None


# ============================================================
# CREATE
# ============================================================

class ExamCreate(ExamBase):
    pass


# ============================================================
# UPDATE
# ============================================================

class ExamUpdate(BaseModel):
    exam_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    exam_type: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    academic_year: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    term: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    description: Optional[str] = None

    class_name: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    section: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    subject_name: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    subject_code: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    exam_date: Optional[date] = None

    start_time: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    end_time: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    duration_minutes: Optional[int] = Field(
        default=None,
        ge=1,
    )

    room_number: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    maximum_marks: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    passing_marks: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    status: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    is_published: Optional[bool] = None

    instructions: Optional[str] = None
    remarks: Optional[str] = None


# ============================================================
# RESPONSE
# ============================================================

class ExamResponse(ExamBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exam_code: str
    created_at: datetime
    updated_at: datetime


# ============================================================
# LIST ITEM
# ============================================================

class ExamListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exam_code: str
    exam_name: str
    exam_type: str

    academic_year: str
    term: Optional[str] = None

    class_name: str
    section: Optional[str] = None

    subject_name: str
    subject_code: Optional[str] = None

    exam_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    room_number: Optional[str] = None

    maximum_marks: Decimal
    passing_marks: Decimal

    status: str
    is_published: bool

    created_at: datetime


# ============================================================
# PAGINATED LIST RESPONSE
# ============================================================

class ExamListResponse(BaseModel):
    items: List[ExamListItem]

    total: int
    page: int
    page_size: int
    total_pages: int


# ============================================================
# EXAM SUMMARY
# ============================================================

class ExamSummary(BaseModel):
    total_exams: int = 0
    scheduled_exams: int = 0
    completed_exams: int = 0
    cancelled_exams: int = 0
    published_exams: int = 0
    unpublished_exams: int = 0


# ============================================================
# STATUS UPDATE
# ============================================================

class ExamStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        min_length=1,
        max_length=30,
    )


# ============================================================
# PUBLISH UPDATE
# ============================================================

class ExamPublishUpdate(BaseModel):
    is_published: bool


# ============================================================
# EXAM DASHBOARD ITEM
# ============================================================

class ExamDashboardItem(BaseModel):
    id: int
    exam_code: str
    exam_name: str
    exam_type: str
    academic_year: str
    term: Optional[str] = None
    class_name: str
    section: Optional[str] = None
    subject_name: str
    exam_date: date
    status: str
    is_published: bool
    maximum_marks: Decimal
    passing_marks: Decimal