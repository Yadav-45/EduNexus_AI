from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class FeeFinePolicyCreate(BaseModel):
    name: str = Field(min_length=3, max_length=150)
    academic_year: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    due_after_days: int = Field(
        default=30,
        ge=0,
        le=3650,
    )

    grace_period_days: int = Field(
        default=0,
        ge=0,
        le=3650,
    )

    fine_type: str = Field(
        default="FIXED",
        min_length=5,
        max_length=20,
    )

    fine_value: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
    )

    recurring_fine: bool = False

    recurring_period_days: int = Field(
        default=30,
        ge=1,
        le=3650,
    )

    status: str = Field(
        default="ACTIVE",
        min_length=1,
        max_length=30,
    )

    @field_validator("fine_type")
    @classmethod
    def validate_fine_type(cls, value):
        value = value.upper()

        if value not in {"FIXED", "PERCENTAGE"}:
            raise ValueError(
                "Fine type must be FIXED or PERCENTAGE."
            )

        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        value = value.upper()

        if value not in {"ACTIVE", "INACTIVE"}:
            raise ValueError(
                "Status must be ACTIVE or INACTIVE."
            )

        return value


class FeeFinePolicyUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=150,
    )

    due_after_days: Optional[int] = Field(
        default=None,
        ge=0,
        le=3650,
    )

    grace_period_days: Optional[int] = Field(
        default=None,
        ge=0,
        le=3650,
    )

    fine_type: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    fine_value: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    recurring_fine: Optional[bool] = None

    recurring_period_days: Optional[int] = Field(
        default=None,
        ge=1,
        le=3650,
    )

    status: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    @field_validator("fine_type")
    @classmethod
    def validate_fine_type(cls, value):
        if value is None:
            return value

        value = value.upper()

        if value not in {"FIXED", "PERCENTAGE"}:
            raise ValueError(
                "Fine type must be FIXED or PERCENTAGE."
            )

        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        if value is None:
            return value

        value = value.upper()

        if value not in {"ACTIVE", "INACTIVE"}:
            raise ValueError(
                "Status must be ACTIVE or INACTIVE."
            )

        return value


class FeeFinePolicyResponse(BaseModel):
    id: int
    name: str
    academic_year: Optional[str]
    due_after_days: int
    grace_period_days: int
    fine_type: str
    fine_value: Decimal
    recurring_fine: bool
    recurring_period_days: int
    status: str