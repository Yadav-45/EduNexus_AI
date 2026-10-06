from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# CONSTANTS
# ============================================================

DOCUMENT_CATEGORY_STATUSES = {
    "ACTIVE",
    "INACTIVE",
}

DOCUMENT_APPLIES_TO = {
    "ALL",
    "STUDENT",
    "PARENT",
    "STAFF",
    "TEACHER",
    "SCHOOL",
}

DOCUMENT_VERIFICATION_STATUSES = {
    "PENDING",
    "VERIFIED",
    "REJECTED",
}

DOCUMENT_ENTITY_TYPES = {
    "STUDENT",
    "PARENT",
    "STAFF",
    "TEACHER",
    "SCHOOL",
}

ALLOWED_FILE_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".txt",
}

MAX_FILE_SIZE = 10 * 1024 * 1024


# ============================================================
# DOCUMENT CATEGORY
# ============================================================

class DocumentCategoryCreate(BaseModel):
    category_name: str = Field(
        min_length=2,
        max_length=150,
    )

    description: Optional[str] = None

    applies_to: str = "ALL"

    status: str = "ACTIVE"


class DocumentCategoryUpdate(BaseModel):
    category_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    description: Optional[str] = None

    applies_to: Optional[str] = None

    status: Optional[str] = None


class DocumentCategoryResponse(BaseModel):
    id: int
    category_code: str
    category_name: str
    description: Optional[str]
    applies_to: str
    status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class DocumentCategoryListResponse(BaseModel):
    items: list[DocumentCategoryResponse]

    page: int
    page_size: int
    total: int
    total_pages: int


# ============================================================
# DOCUMENT CREATE / UPDATE
# ============================================================

class DocumentCreate(BaseModel):
    category_id: Optional[int] = None

    title: str = Field(
        min_length=2,
        max_length=255,
    )

    description: Optional[str] = None

    entity_type: str

    entity_id: Optional[int] = None

    document_date: Optional[date] = None

    expiry_date: Optional[date] = None

    verification_status: str = "PENDING"

    is_confidential: bool = False

    notes: Optional[str] = None


class DocumentUpdate(BaseModel):
    category_id: Optional[int] = None

    title: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=255,
    )

    description: Optional[str] = None

    document_date: Optional[date] = None

    expiry_date: Optional[date] = None

    verification_status: Optional[str] = None

    is_confidential: Optional[bool] = None

    notes: Optional[str] = None


# ============================================================
# DOCUMENT RESPONSE
# ============================================================

class DocumentResponse(BaseModel):
    id: int

    document_number: str

    category_id: Optional[int]

    title: str

    description: Optional[str]

    entity_type: str

    entity_id: Optional[int]

    file_name: str

    original_file_name: str

    file_extension: str

    mime_type: str

    file_size: int

    document_date: Optional[date]

    expiry_date: Optional[date]

    verification_status: str

    verified_by: Optional[int]

    verified_at: Optional[datetime]

    is_confidential: bool

    is_active: bool

    uploaded_by: Optional[int]

    notes: Optional[str]

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class DocumentListResponse(BaseModel):
    items: list[DocumentResponse]

    page: int
    page_size: int
    total: int
    total_pages: int


# ============================================================
# DOCUMENT VERIFICATION
# ============================================================

class DocumentVerificationUpdate(BaseModel):
    verification_status: str

    notes: Optional[str] = None


# ============================================================
# DOCUMENT DASHBOARD
# ============================================================

class DocumentDashboardResponse(BaseModel):
    total_documents: int

    active_documents: int

    archived_documents: int

    pending_verification: int

    verified_documents: int

    rejected_documents: int

    expiring_documents: int

    expired_documents: int

    confidential_documents: int

    total_categories: int


# ============================================================
# DOCUMENT EXPIRY
# ============================================================

class DocumentExpiryResponse(BaseModel):
    id: int

    document_number: str

    title: str

    entity_type: str

    entity_id: Optional[int]

    expiry_date: date

    days_remaining: int

    verification_status: str

    is_active: bool

    model_config = ConfigDict(
        from_attributes=True
    )


class DocumentExpiryListResponse(BaseModel):
    items: list[DocumentExpiryResponse]

    page: int
    page_size: int
    total: int
    total_pages: int


# ============================================================
# DOCUMENT DOWNLOAD / FILE INFORMATION
# ============================================================

class DocumentFileResponse(BaseModel):
    id: int

    document_number: str

    original_file_name: str

    file_name: str

    file_extension: str

    mime_type: str

    file_size: int

    download_available: bool


# ============================================================
# DOCUMENT ARCHIVE / RESTORE
# ============================================================

class DocumentArchiveResponse(BaseModel):
    id: int

    document_number: str

    is_active: bool

    message: str


# ============================================================
# DOCUMENT CATEGORY ARCHIVE / RESTORE
# ============================================================

class DocumentCategoryArchiveResponse(BaseModel):
    id: int

    category_code: str

    is_active: bool

    message: str