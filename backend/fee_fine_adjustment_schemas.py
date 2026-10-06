from decimal import Decimal

from pydantic import BaseModel, Field


class FeeFineAdjustmentCreate(BaseModel):
    adjusted_amount: Decimal = Field(
        ge=0,
    )
    adjustment_type: str = Field(
        min_length=1,
        max_length=30,
    )
    reason: str = Field(
        min_length=3,
        max_length=500,
    )


class FeeFineAdjustmentResponse(BaseModel):
    success: bool
    fee_fine_id: int
    original_amount: Decimal
    adjusted_amount: Decimal
    remaining_fine: Decimal
    adjustment_type: str
    reason: str
    message: str