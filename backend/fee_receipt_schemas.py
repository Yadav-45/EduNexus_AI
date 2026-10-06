from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class FeeReceiptResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    receipt_number: str
    fee_payment_id: int
    fee_account_id: int
    amount: Decimal
    previous_balance: Decimal
    remaining_balance: Decimal
    payment_method: str
    transaction_reference: Optional[str]
    receipt_date: datetime
    remarks: Optional[str]
    status: str