from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FeeStructureCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=150,
    )

    academic_year: str = Field(
        min_length=4,
        max_length=20,
    )

    class_name: str = Field(
        min_length=1,
        max_length=100,
    )

    admission_fee: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
    )

    tuition_fee: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
    )

    transport_fee: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
    )

    examination_fee: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
    )

    activity_fee: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
    )

    other_fee: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
    )

    description: Optional[str] = None


class FeeStructureUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    academic_year: Optional[str] = Field(
        default=None,
        min_length=4,
        max_length=20,
    )

    class_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    admission_fee: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    tuition_fee: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    transport_fee: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    examination_fee: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    activity_fee: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    other_fee: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    description: Optional[str] = None

    status: Optional[str] = Field(
        default=None,
        max_length=30,
    )


class FeeStructureResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    name: str
    academic_year: str
    class_name: str

    admission_fee: Decimal
    tuition_fee: Decimal
    transport_fee: Decimal
    examination_fee: Decimal
    activity_fee: Decimal
    other_fee: Decimal
    total_fee: Decimal

    description: Optional[str]
    status: str