from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class FeePaymentReversalRequest(BaseModel):
    reason: str


class FeePaymentReversalResponse(BaseModel):
    success: bool
    payment_id: int
    fee_account_id: int
    student_id: int
    amount_reversed: Decimal
    previous_balance: Decimal
    new_balance: Decimal
    payment_status: str
    receipt_status: str | None
    reversed_at: datetime
    reason: str
    message: str