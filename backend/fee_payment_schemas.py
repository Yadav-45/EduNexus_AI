from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FeePaymentCreate(BaseModel):
    amount: Decimal = Field(
        gt=0,
    )

    payment_method: str = Field(
        default="CASH",
        min_length=2,
        max_length=30,
    )

    transaction_reference: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    remarks: Optional[str] = None


class FeePaymentResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    fee_account_id: int
    amount: Decimal
    payment_method: str
    transaction_reference: Optional[str]
    payment_date: datetime
    remarks: Optional[str]
    status: str