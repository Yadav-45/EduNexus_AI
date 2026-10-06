from decimal import Decimal

from pydantic import BaseModel


class FeeFineAdjustmentSummaryResponse(BaseModel):
    total_adjustments: int
    total_adjusted_amount: Decimal
    total_fines_adjusted: int
    fully_waived_fines: int
    partially_adjusted_fines: int
    adjustments_by_type: dict[str, Decimal]