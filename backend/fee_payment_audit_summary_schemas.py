from decimal import Decimal

from pydantic import BaseModel


class FeePaymentMethodSummary(BaseModel):
    payment_method: str
    payment_count: int
    total_amount: Decimal


class FeePaymentAuditSummaryResponse(BaseModel):
    total_payments: int
    successful_payments: int
    reversed_payments: int
    total_successful_collection: Decimal
    total_reversed_amount: Decimal
    payment_methods: list[
        FeePaymentMethodSummary
    ]