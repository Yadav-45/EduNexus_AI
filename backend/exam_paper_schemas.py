from datetime import date, time, datetime
from typing import Optional, List

from pydantic import BaseModel, Field, ConfigDict


# ============================================================
# BASE
# ============================================================

class ExamPaperBase(BaseModel):
    exam_id: int

    paper_name: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )

    subject_name: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )

    subject_code: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    class_name: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    section: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    exam_date: date

    start_time: Optional[time] = None

    end_time: Optional[time] = None

    duration_minutes: Optional[int] = Field(
        default=None,
        ge=1,
    )

    room_number: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    maximum_marks: float = Field(
        ...,
        gt=0,
    )

    passing_marks: float = Field(
        ...,
        ge=0,
    )

    status: str = Field(
        default="SCHEDULED",
        max_length=30,
    )

    is_published: bool = False

    instructions: Optional[str] = None

    remarks: Optional[str] = None


# ============================================================
# CREATE
# ============================================================

class ExamPaperCreate(ExamPaperBase):
    pass


# ============================================================
# UPDATE
# ============================================================

class ExamPaperUpdate(BaseModel):
    model_config = ConfigDict(
        extra="forbid"
    )

    paper_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    subject_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    subject_code: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    class_name: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    section: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    exam_date: Optional[date] = None

    start_time: Optional[time] = None

    end_time: Optional[time] = None

    duration_minutes: Optional[int] = Field(
        default=None,
        ge=1,
    )

    room_number: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    maximum_marks: Optional[float] = Field(
        default=None,
        gt=0,
    )

    passing_marks: Optional[float] = Field(
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

class ExamPaperResponse(ExamPaperBase):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ============================================================
# LIST ITEM
# ============================================================

class ExamPaperListItem(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    exam_id: int

    paper_name: str

    subject_name: str

    subject_code: Optional[str] = None

    class_name: Optional[str] = None

    section: Optional[str] = None

    exam_date: date

    start_time: Optional[time] = None

    end_time: Optional[time] = None

    duration_minutes: Optional[int] = None

    room_number: Optional[str] = None

    maximum_marks: float

    passing_marks: float

    status: str

    is_published: bool

    exam_name: Optional[str] = None

    academic_year: Optional[str] = None

    created_at: Optional[datetime] = None


# ============================================================
# LIST RESPONSE
# ============================================================

class ExamPaperListResponse(BaseModel):
    items: List[ExamPaperListItem]

    total: int

    page: int

    page_size: int

    total_pages: int


# ============================================================
# SUMMARY
# ============================================================

class ExamPaperSummary(BaseModel):
    total_papers: int

    scheduled: int

    ongoing: int

    completed: int

    cancelled: int

    published: int

    unpublished: int


# ============================================================
# STATUS UPDATE
# ============================================================

class ExamPaperStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        max_length=30,
    )


# ============================================================
# PUBLISH UPDATE
# ============================================================

class ExamPaperPublishUpdate(BaseModel):
    is_published: bool


# ============================================================
# MESSAGE
# ============================================================

class ExamPaperMessage(BaseModel):
    message: str