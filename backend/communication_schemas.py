from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# CONSTANTS
# ============================================================

NOTICE_TYPES = {
    "GENERAL",
    "ACADEMIC",
    "FEE",
    "ATTENDANCE",
    "EXAM",
    "HOLIDAY",
    "EVENT",
    "EMERGENCY",
    "TRANSPORT",
    "ADMISSION",
    "OTHER",
}

NOTICE_PRIORITIES = {
    "LOW",
    "NORMAL",
    "HIGH",
    "URGENT",
}

NOTICE_STATUSES = {
    "DRAFT",
    "SCHEDULED",
    "PUBLISHED",
    "ARCHIVED",
}

TARGET_TYPES = {
    "ALL",
    "STUDENTS",
    "PARENTS",
    "TEACHERS",
    "STAFF",
    "CLASS",
    "SECTION",
    "INDIVIDUAL",
}

DELIVERY_STATUSES = {
    "PENDING",
    "SENT",
    "DELIVERED",
    "FAILED",
}


# ============================================================
# NOTICE CREATE
# ============================================================

class CommunicationNoticeCreate(BaseModel):
    title: str = Field(
        min_length=3,
        max_length=255,
    )

    message: str = Field(
        min_length=1,
    )

    notice_type: str = "GENERAL"

    priority: str = "NORMAL"

    target_type: str = "ALL"

    target_class: Optional[str] = None

    target_section: Optional[str] = None

    publish_at: Optional[datetime] = None

    expires_at: Optional[datetime] = None


# ============================================================
# NOTICE UPDATE
# ============================================================

class CommunicationNoticeUpdate(BaseModel):
    title: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=255,
    )

    message: Optional[str] = Field(
        default=None,
        min_length=1,
    )

    notice_type: Optional[str] = None

    priority: Optional[str] = None

    target_type: Optional[str] = None

    target_class: Optional[str] = None

    target_section: Optional[str] = None

    publish_at: Optional[datetime] = None

    expires_at: Optional[datetime] = None


# ============================================================
# STATUS UPDATE
# ============================================================

class CommunicationNoticeStatusUpdate(BaseModel):
    status: str


# ============================================================
# NOTICE RESPONSE
# ============================================================

class CommunicationNoticeResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    notice_number: str

    title: str

    message: str

    notice_type: str

    priority: str

    status: str

    target_type: str

    target_class: Optional[str]

    target_section: Optional[str]

    publish_at: Optional[datetime]

    expires_at: Optional[datetime]

    is_active: bool

    created_by: Optional[int]

    published_by: Optional[int]

    published_at: Optional[datetime]

    created_at: datetime

    updated_at: datetime


# ============================================================
# PAGINATED NOTICE RESPONSE
# ============================================================

class CommunicationNoticeListResponse(BaseModel):
    items: list[CommunicationNoticeResponse]

    page: int

    page_size: int

    total: int

    total_pages: int


# ============================================================
# RECIPIENT RESPONSE
# ============================================================

class CommunicationRecipientResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    notice_id: int

    recipient_user_id: int

    recipient_role: Optional[str]

    delivery_status: str

    sent_at: Optional[datetime]

    delivered_at: Optional[datetime]

    read_at: Optional[datetime]

    is_read: bool

    created_at: datetime

    updated_at: datetime


# ============================================================
# PAGINATED RECIPIENT RESPONSE
# ============================================================

class CommunicationRecipientListResponse(BaseModel):
    items: list[CommunicationRecipientResponse]

    page: int

    page_size: int

    total: int

    total_pages: int


# ============================================================
# MARK AS READ
# ============================================================

class CommunicationReadResponse(BaseModel):
    message: str

    notice_id: int

    recipient_id: int

    is_read: bool

    read_at: Optional[datetime]


# ============================================================
# COMMUNICATION DASHBOARD
# ============================================================

class CommunicationDashboardResponse(BaseModel):
    total_notices: int

    draft_notices: int

    scheduled_notices: int

    published_notices: int

    archived_notices: int

    active_notices: int

    total_recipients: int

    unread_recipients: int

    read_recipients: int

    failed_recipients: int