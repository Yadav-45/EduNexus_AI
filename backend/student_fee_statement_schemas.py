from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class StudentFeePaymentResponse(BaseModel):
    id: int
    amount: Decimal
    payment_method: str
    transaction_reference: Optional[str]
    payment_date: datetime
    status: str


class StudentFeeReceiptResponse(BaseModel):
    id: int
    receipt_number: str
    payment_id: int
    amount: Decimal
    previous_balance: Decimal
    remaining_balance: Decimal
    payment_method: str
    transaction_reference: Optional[str]
    receipt_date: datetime
    status: str


class StudentFeeStatementResponse(BaseModel):
    student_id: int
    admission_number: str
    student_name: str
    class_name: Optional[str]
    academic_year: str
    fee_account_id: int
    total_due: Decimal
    total_paid: Decimal
    outstanding_balance: Decimal
    fee_account_status: str
    payments: list[
        StudentFeePaymentResponse
    ]
    receipts: list[
        StudentFeeReceiptResponse
    ]