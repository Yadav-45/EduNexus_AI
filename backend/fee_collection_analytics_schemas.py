from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class CollectionByMethodResponse(BaseModel):
    payment_method: str
    total_amount: Decimal
    payment_count: int


class RecentPaymentResponse(BaseModel):
    id: int
    fee_account_id: int
    amount: Decimal
    payment_method: str
    transaction_reference: Optional[str]
    payment_date: datetime
    status: str


class FeeCollectionAnalyticsResponse(BaseModel):
    today_collection: Decimal
    today_payment_count: int
    collection_by_method: list[
        CollectionByMethodResponse
    ]
    recent_payments: list[
        RecentPaymentResponse
    ]