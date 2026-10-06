from decimal import Decimal

from pydantic import BaseModel


class FeeFineDashboardOverviewResponse(BaseModel):
    total_fee_accounts: int
    current_accounts: int
    overdue_accounts: int
    paid_accounts: int

    total_outstanding: Decimal
    total_overdue: Decimal

    total_fines: Decimal
    active_fines: Decimal
    waived_fines: Decimal

    total_adjustments: int
    total_adjusted_amount: Decimal

    aging_buckets: dict[str, int]