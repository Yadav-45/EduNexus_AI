from datetime import date, datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


# ============================================================
# ADMISSION STATUSES
# ============================================================

ADMISSION_STATUSES = {
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "WAITLISTED",
    "APPROVED",
    "REJECTED",
    "ENROLLED",
    "WITHDRAWN",
}


# ============================================================
# CREATE ADMISSION
# ============================================================

class AdmissionCreate(BaseModel):

    academic_year: str = Field(
        min_length=1,
        max_length=20,
    )

    application_date: date | None = None

    # --------------------------------------------------------
    # Student Information
    # --------------------------------------------------------

    first_name: str = Field(
        min_length=1,
        max_length=100,
    )

    last_name: str | None = Field(
        default=None,
        max_length=100,
    )

    date_of_birth: date | None = None

    gender: str | None = Field(
        default=None,
        max_length=20,
    )

    applying_class: str = Field(
        min_length=1,
        max_length=100,
    )

    applying_section: str | None = Field(
        default=None,
        max_length=50,
    )

    # --------------------------------------------------------
    # Parent Information
    # --------------------------------------------------------

    parent_name: str = Field(
        min_length=1,
        max_length=200,
    )

    parent_relationship: str | None = Field(
        default=None,
        max_length=50,
    )

    parent_phone: str = Field(
        min_length=3,
        max_length=30,
    )

    parent_email: str | None = Field(
        default=None,
        max_length=150,
    )

    parent_occupation: str | None = Field(
        default=None,
        max_length=100,
    )

    parent_address: str | None = None

    # --------------------------------------------------------
    # Previous School
    # --------------------------------------------------------

    previous_school_name: str | None = Field(
        default=None,
        max_length=200,
    )

    previous_class: str | None = Field(
        default=None,
        max_length=100,
    )

    previous_board: str | None = Field(
        default=None,
        max_length=100,
    )

    previous_academic_year: str | None = Field(
        default=None,
        max_length=20,
    )

    # --------------------------------------------------------
    # Admission Workflow
    # --------------------------------------------------------

    status: str = "APPLIED"

    source: str | None = Field(
        default=None,
        max_length=50,
    )

    notes: str | None = None


# ============================================================
# UPDATE ADMISSION
# ============================================================

class AdmissionUpdate(BaseModel):

    academic_year: str | None = Field(
        default=None,
        max_length=20,
    )

    application_date: date | None = None

    # --------------------------------------------------------
    # Student Information
    # --------------------------------------------------------

    first_name: str | None = Field(
        default=None,
        max_length=100,
    )

    last_name: str | None = Field(
        default=None,
        max_length=100,
    )

    date_of_birth: date | None = None

    gender: str | None = Field(
        default=None,
        max_length=20,
    )

    applying_class: str | None = Field(
        default=None,
        max_length=100,
    )

    applying_section: str | None = Field(
        default=None,
        max_length=50,
    )

    # --------------------------------------------------------
    # Parent Information
    # --------------------------------------------------------

    parent_name: str | None = Field(
        default=None,
        max_length=200,
    )

    parent_relationship: str | None = Field(
        default=None,
        max_length=50,
    )

    parent_phone: str | None = Field(
        default=None,
        max_length=30,
    )

    parent_email: str | None = Field(
        default=None,
        max_length=150,
    )

    parent_occupation: str | None = Field(
        default=None,
        max_length=100,
    )

    parent_address: str | None = None

    # --------------------------------------------------------
    # Previous School
    # --------------------------------------------------------

    previous_school_name: str | None = Field(
        default=None,
        max_length=200,
    )

    previous_class: str | None = Field(
        default=None,
        max_length=100,
    )

    previous_board: str | None = Field(
        default=None,
        max_length=100,
    )

    previous_academic_year: str | None = Field(
        default=None,
        max_length=20,
    )

    # --------------------------------------------------------
    # Workflow
    # --------------------------------------------------------

    status: str | None = None

    source: str | None = Field(
        default=None,
        max_length=50,
    )

    notes: str | None = None


# ============================================================
# STATUS UPDATE
# ============================================================

class AdmissionStatusUpdate(BaseModel):

    status: str


# ============================================================
# ADMISSION RESPONSE
# ============================================================

class AdmissionResponse(BaseModel):

    id: int

    application_number: str

    academic_year: str

    application_date: date

    # --------------------------------------------------------
    # Student
    # --------------------------------------------------------

    first_name: str

    last_name: str | None

    date_of_birth: date | None

    gender: str | None

    applying_class: str

    applying_section: str | None

    # --------------------------------------------------------
    # Parent
    # --------------------------------------------------------

    parent_name: str

    parent_relationship: str | None

    parent_phone: str

    parent_email: str | None

    parent_occupation: str | None

    parent_address: str | None

    # --------------------------------------------------------
    # Previous School
    # --------------------------------------------------------

    previous_school_name: str | None

    previous_class: str | None

    previous_board: str | None

    previous_academic_year: str | None

    # --------------------------------------------------------
    # Workflow
    # --------------------------------------------------------

    status: str

    source: str | None

    notes: str | None

    # --------------------------------------------------------
    # Record State
    # --------------------------------------------------------

    is_active: bool

    # --------------------------------------------------------
    # Audit
    # --------------------------------------------------------

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# PAGINATED ADMISSION RESPONSE
# ============================================================

class AdmissionListResponse(BaseModel):

    items: list[AdmissionResponse]

    total: int

    page: int

    page_size: int

    total_pages: int