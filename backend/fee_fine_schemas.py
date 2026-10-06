from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class FeeFineItem(BaseModel):
    id: int
    fee_account_id: int
    student_id: int
    student_name: str
    academic_year: str
    amount: Decimal
    fine_type: str
    days_overdue: int
    reason: Optional[str] = None
    status: str


class FeeFineManagementResponse(BaseModel):
    data: list[FeeFineItem]
    pagination: dict
    total_fine_amount: Decimal