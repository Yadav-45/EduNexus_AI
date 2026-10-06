from decimal import Decimal

from pydantic import BaseModel


class FeeDashboardSummaryResponse(BaseModel):
    total_due: Decimal
    total_paid: Decimal
    total_balance: Decimal
    total_accounts: int
    active_accounts: int
    total_successful_payments: int