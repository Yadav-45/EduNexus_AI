from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class FeePaymentAuditItem(BaseModel):
    payment_id: int
    fee_account_id: int
    student_id: int

    admission_number: str
    student_name: str
    class_name: Optional[str]
    academic_year: str

    amount: Decimal
    payment_method: str
    transaction_reference: Optional[str]
    payment_date: datetime

    payment_status: str

    receipt_id: Optional[int]
    receipt_number: Optional[str]
    receipt_status: Optional[str]

    reversal_reason: Optional[str]
    reversed_at: Optional[datetime]


class FeePaymentAuditPagination(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class FeePaymentAuditHistoryResponse(BaseModel):
    data: list[FeePaymentAuditItem]
    pagination: FeePaymentAuditPagination