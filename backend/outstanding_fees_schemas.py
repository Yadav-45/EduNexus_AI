from decimal import Decimal

from pydantic import BaseModel


class OutstandingFeeResponse(BaseModel):
    fee_account_id: int
    student_id: int
    admission_number: str
    student_name: str
    class_name: str | None
    academic_year: str
    total_due: Decimal
    total_paid: Decimal
    outstanding_balance: Decimal
    status: str


class OutstandingFeePagination(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class OutstandingFeesResponse(BaseModel):
    data: list[OutstandingFeeResponse]
    pagination: OutstandingFeePagination