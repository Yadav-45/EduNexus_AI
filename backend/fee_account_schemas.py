from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FeeAccountUpdate(BaseModel):
    total_due: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    total_paid: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    status: Optional[str] = Field(
        default=None,
        max_length=30,
    )


class FeeAccountResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    student_id: int
    academic_year: str

    total_due: Decimal
    total_paid: Decimal
    balance: Decimal

    status: str