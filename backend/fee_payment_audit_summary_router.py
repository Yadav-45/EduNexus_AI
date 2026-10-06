from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from fee_payment_audit_summary_schemas import (
    FeePaymentAuditSummaryResponse,
)

from fee_payment_audit_summary_service import (
    get_fee_payment_audit_summary,
)


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Payment Audit Summary"],
)


@router.get(
    "/payment-audit-summary",
    response_model=FeePaymentAuditSummaryResponse,
)
def payment_audit_summary(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    return get_fee_payment_audit_summary(
        db=db,
    )