from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class FeeAgingBucketSummary(BaseModel):
    accounts: int
    outstanding: Decimal
    fine: Decimal


class FeeAgingSummaryResponse(BaseModel):
    academic_year: Optional[str]

    total_accounts: int
    current_accounts: int
    overdue_accounts: int
    paid_accounts: int

    total_outstanding: Decimal
    total_overdue: Decimal
    total_fines: Decimal
    total_with_fines: Decimal

    aging_buckets: dict[str, FeeAgingBucketSummary]