from decimal import Decimal

from pydantic import BaseModel


class FeeFineAnalyticsResponse(BaseModel):
    fines_by_type: dict[str, Decimal]
    fines_by_status: dict[str, Decimal]
    adjustments_by_type: dict[str, Decimal]
    aging_distribution: dict[str, int]
    outstanding_vs_fines: dict[str, Decimal]