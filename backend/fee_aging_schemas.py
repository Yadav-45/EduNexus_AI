from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class FeeDefaulterItem(BaseModel):
    fee_account_id: int
    student_id: int

    admission_number: str
    student_name: str
    class_name: Optional[str]

    academic_year: str

    total_due: Decimal
    total_paid: Decimal
    outstanding_amount: Decimal

    due_date: Optional[datetime]

    days_overdue: int
    aging_bucket: str

    fine_amount: Decimal
    total_due_with_fine: Decimal


class FeeAgingPagination(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class FeeDefaulterResponse(BaseModel):
    data: list[FeeDefaulterItem]
    pagination: FeeAgingPagination