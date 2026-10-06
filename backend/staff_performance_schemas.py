from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel, Field, ConfigDict


# ============================================================
# BASE SCHEMA
# ============================================================

class StaffPerformanceBase(BaseModel):
    staff_id: int

    review_period: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    review_start_date: date
    review_end_date: date

    review_date: Optional[date] = None

    # ========================================================
    # PERFORMANCE SCORES
    # ========================================================

    teaching_quality_score: Decimal = Field(
        default=0,
        ge=0,
        le=100,
    )

    student_engagement_score: Decimal = Field(
        default=0,
        ge=0,
        le=100,
    )

    attendance_score: Decimal = Field(
        default=0,
        ge=0,
        le=100,
    )

    discipline_score: Decimal = Field(
        default=0,
        ge=0,
        le=100,
    )

    teamwork_score: Decimal = Field(
        default=0,
        ge=0,
        le=100,
    )

    communication_score: Decimal = Field(
        default=0,
        ge=0,
        le=100,
    )

    technology_score: Decimal = Field(
        default=0,
        ge=0,
        le=100,
    )

    leadership_score: Decimal = Field(
        default=0,
        ge=0,
        le=100,
    )

    # ========================================================
    # OVERALL PERFORMANCE
    # ========================================================

    overall_score: Decimal = Field(
        default=0,
        ge=0,
        le=100,
    )

    rating: str = Field(
        default="NOT_RATED",
        max_length=30,
    )

    # ========================================================
    # GOALS / KPI
    # ========================================================

    goals: Optional[str] = None

    goals_achieved: Optional[str] = None

    kpi_score: Decimal = Field(
        default=0,
        ge=0,
        le=100,
    )

    # ========================================================
    # FEEDBACK
    # ========================================================

    strengths: Optional[str] = None

    areas_for_improvement: Optional[str] = None

    manager_comments: Optional[str] = None

    employee_comments: Optional[str] = None

    # ========================================================
    # CAREER / APPRAISAL
    # ========================================================

    promotion_recommended: str = Field(
        default="NO",
        max_length=10,
    )

    increment_recommended: str = Field(
        default="NO",
        max_length=10,
    )

    recommended_increment_percentage: Decimal = Field(
        default=0,
        ge=0,
        le=100,
    )

    training_required: str = Field(
        default="NO",
        max_length=10,
    )

    training_recommendation: Optional[str] = None

    # ========================================================
    # STATUS
    # ========================================================

    status: str = Field(
        default="DRAFT",
        max_length=30,
    )

    remarks: Optional[str] = None


# ============================================================
# CREATE
# ============================================================

class StaffPerformanceCreate(StaffPerformanceBase):
    pass


# ============================================================
# UPDATE
# ============================================================

class StaffPerformanceUpdate(BaseModel):
    review_period: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    review_start_date: Optional[date] = None

    review_end_date: Optional[date] = None

    review_date: Optional[date] = None

    teaching_quality_score: Optional[Decimal] = Field(
        default=None,
        ge=0,
        le=100,
    )

    student_engagement_score: Optional[Decimal] = Field(
        default=None,
        ge=0,
        le=100,
    )

    attendance_score: Optional[Decimal] = Field(
        default=None,
        ge=0,
        le=100,
    )

    discipline_score: Optional[Decimal] = Field(
        default=None,
        ge=0,
        le=100,
    )

    teamwork_score: Optional[Decimal] = Field(
        default=None,
        ge=0,
        le=100,
    )

    communication_score: Optional[Decimal] = Field(
        default=None,
        ge=0,
        le=100,
    )

    technology_score: Optional[Decimal] = Field(
        default=None,
        ge=0,
        le=100,
    )

    leadership_score: Optional[Decimal] = Field(
        default=None,
        ge=0,
        le=100,
    )

    overall_score: Optional[Decimal] = Field(
        default=None,
        ge=0,
        le=100,
    )

    rating: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    goals: Optional[str] = None

    goals_achieved: Optional[str] = None

    kpi_score: Optional[Decimal] = Field(
        default=None,
        ge=0,
        le=100,
    )

    strengths: Optional[str] = None

    areas_for_improvement: Optional[str] = None

    manager_comments: Optional[str] = None

    employee_comments: Optional[str] = None

    promotion_recommended: Optional[str] = Field(
        default=None,
        max_length=10,
    )

    increment_recommended: Optional[str] = Field(
        default=None,
        max_length=10,
    )

    recommended_increment_percentage: Optional[Decimal] = Field(
        default=None,
        ge=0,
        le=100,
    )

    training_required: Optional[str] = Field(
        default=None,
        max_length=10,
    )

    training_recommendation: Optional[str] = None

    status: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    remarks: Optional[str] = None


# ============================================================
# RESPONSE
# ============================================================

class StaffPerformanceResponse(StaffPerformanceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int

    reviewed_by: Optional[int] = None

    reviewed_at: Optional[datetime] = None

    created_at: datetime

    updated_at: datetime


# ============================================================
# LIST ITEM
# ============================================================

class StaffPerformanceListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int

    staff_id: int

    staff_code: Optional[str] = None

    staff_name: Optional[str] = None

    department: Optional[str] = None

    designation: Optional[str] = None

    review_period: str

    review_start_date: date

    review_end_date: date

    overall_score: Decimal

    rating: str

    kpi_score: Decimal

    promotion_recommended: str

    increment_recommended: str

    recommended_increment_percentage: Decimal

    training_required: str

    status: str

    review_date: Optional[date] = None

    created_at: datetime


# ============================================================
# LIST RESPONSE
# ============================================================

class StaffPerformanceListResponse(BaseModel):
    items: List[StaffPerformanceListItem]

    total: int

    page: int

    page_size: int

    total_pages: int


# ============================================================
# SUMMARY
# ============================================================

class StaffPerformanceSummary(BaseModel):
    total_reviews: int = 0

    draft_reviews: int = 0

    submitted_reviews: int = 0

    approved_reviews: int = 0

    completed_reviews: int = 0

    average_score: Decimal = Decimal("0")

    excellent_count: int = 0

    very_good_count: int = 0

    good_count: int = 0

    needs_improvement_count: int = 0

    promotion_recommended: int = 0

    increment_recommended: int = 0

    training_required: int = 0


# ============================================================
# STATUS UPDATE
# ============================================================

class StaffPerformanceStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        min_length=1,
        max_length=30,
    )

    remarks: Optional[str] = None


# ============================================================
# REVIEW SUBMISSION
# ============================================================

class StaffPerformanceSubmit(BaseModel):
    manager_comments: Optional[str] = None

    employee_comments: Optional[str] = None

    remarks: Optional[str] = None


# ============================================================
# APPROVAL
# ============================================================

class StaffPerformanceApproval(BaseModel):
    approved: bool

    remarks: Optional[str] = None