from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class FeeFineAdjustmentHistoryItem(BaseModel):
    id: int
    fee_fine_id: int
    student_id: int
    student_name: str
    fee_account_id: int
    academic_year: str
    adjusted_amount: Decimal
    adjustment_type: str
    reason: str
    adjusted_by_user_id: int
    adjusted_by_user_name: Optional[str] = None
    created_at: Optional[str] = None


class FeeFineAdjustmentHistoryResponse(BaseModel):
    data: list[FeeFineAdjustmentHistoryItem]
    pagination: dict
    total_adjusted_amount: Decimal