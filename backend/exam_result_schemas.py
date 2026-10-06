from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


# ============================================================
# BASE
# ============================================================

class ExamResultBase(BaseModel):
    exam_id: int

    exam_paper_id: int

    student_id: int

    marks_obtained: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    maximum_marks: Decimal = Field(
        default=Decimal("100"),
        ge=0,
    )

    passing_marks: Decimal = Field(
        default=Decimal("33"),
        ge=0,
    )

    is_absent: bool = False

    is_published: bool = False

    remarks: Optional[str] = None


# ============================================================
# CREATE
# ============================================================

class ExamResultCreate(ExamResultBase):
    pass


# ============================================================
# UPDATE
# ============================================================

class ExamResultUpdate(BaseModel):
    marks_obtained: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    maximum_marks: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    passing_marks: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    is_absent: Optional[bool] = None

    is_published: Optional[bool] = None

    remarks: Optional[str] = None


# ============================================================
# PUBLISH
# ============================================================

class ExamResultPublishUpdate(BaseModel):
    is_published: bool


# ============================================================
# RESPONSE
# ============================================================

class ExamResultResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    exam_id: int
    exam_paper_id: int
    student_id: int

    marks_obtained: Optional[Decimal]
    maximum_marks: Decimal
    passing_marks: Decimal

    percentage: Optional[Decimal]

    result_status: str

    is_absent: bool
    is_published: bool

    remarks: Optional[str]

    created_at: datetime
    updated_at: datetime


# ============================================================
# LIST ITEM
# ============================================================

class ExamResultListItem(BaseModel):
    id: int

    exam_id: int
    exam_paper_id: int
    student_id: int

    student_code: Optional[str] = None
    student_name: Optional[str] = None
    class_name: Optional[str] = None
    section: Optional[str] = None

    exam_name: Optional[str] = None
    academic_year: Optional[str] = None

    paper_name: Optional[str] = None
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None

    marks_obtained: Optional[Decimal] = None
    maximum_marks: Decimal
    passing_marks: Decimal

    percentage: Optional[Decimal] = None

    result_status: str

    is_absent: bool
    is_published: bool

    remarks: Optional[str] = None

    created_at: datetime


# ============================================================
# LIST RESPONSE
# ============================================================

class ExamResultListResponse(BaseModel):
    items: List[ExamResultListItem]

    total: int
    page: int
    page_size: int
    total_pages: int


# ============================================================
# SUMMARY
# ============================================================

class ExamResultSummary(BaseModel):
    total_results: int = 0
    passed: int = 0
    failed: int = 0
    absent: int = 0
    pending: int = 0
    published: int = 0
    unpublished: int = 0

    average_marks: Decimal = Decimal("0")
    highest_marks: Decimal = Decimal("0")
    average_percentage: Decimal = Decimal("0")


# ============================================================
# MESSAGE
# ============================================================

class ExamResultMessage(BaseModel):
    message: str