from typing import Optional

from pydantic import BaseModel, Field


class FeeNotificationTemplateCreate(BaseModel):
    name: str = Field(min_length=3, max_length=150)
    notification_type: str = Field(min_length=3, max_length=50)
    channel: str = Field(default="IN_APP", max_length=30)
    subject: Optional[str] = Field(default=None, max_length=250)
    message_template: str = Field(min_length=5, max_length=5000)
    status: str = Field(default="ACTIVE", max_length=30)
    is_default: bool = False


class FeeNotificationTemplateResponse(BaseModel):
    id: int
    name: str
    notification_type: str
    channel: str
    subject: Optional[str]
    message_template: str
    status: str
    is_default: bool


class FeeNotificationTemplateListResponse(BaseModel):
    data: list[FeeNotificationTemplateResponse]
    total: int