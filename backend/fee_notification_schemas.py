from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class FeeNotificationItem(BaseModel):
    fee_account_id: int
    student_id: int
    student_name: str
    academic_year: str

    notification_type: str

    total_due: Decimal
    total_paid: Decimal
    outstanding_amount: Decimal
    fine_amount: Decimal

    due_date: Optional[str] = None
    days_overdue: int

    parent_phone: Optional[str] = None
    parent_email: Optional[str] = None

    message: str


class FeeNotificationResponse(BaseModel):
    data: list[FeeNotificationItem]
    total: int