from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class SchoolIntelligenceSnapshotResponse(BaseModel):
    id: int
    snapshot_date: datetime
    academic_year: Optional[str]

    active_students: int
    inactive_students: int

    total_admissions: int
    pending_admissions: int
    enrolled_admissions: int

    total_fee_due: Decimal
    total_fee_paid: Decimal
    total_fee_outstanding: Decimal
    fee_collection_rate: Decimal

    snapshot_type: str
    created_at: datetime


class SchoolIntelligenceCurrentResponse(BaseModel):
    success: bool
    generated_at: datetime
    academic_year: Optional[str]

    students: dict
    admissions: dict
    finance: dict


class SchoolIntelligenceHistoryResponse(BaseModel):
    success: bool
    data: list[SchoolIntelligenceSnapshotResponse]
    total: int