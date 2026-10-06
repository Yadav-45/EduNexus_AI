from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from fee_payment_audit_schemas import (
    FeePaymentAuditHistoryResponse,
)

from fee_payment_audit_service import (
    get_fee_payment_audit_history,
)


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Payment Audit"],
)


@router.get(
    "/payment-audit",
    response_model=FeePaymentAuditHistoryResponse,
)
def get_payment_audit_history(
    search: str | None = Query(
        default=None,
        max_length=100,
        description=(
            "Search by student name, admission number, "
            "transaction reference, or receipt number."
        ),
    ),
    status: str | None = Query(
        default=None,
        max_length=30,
        description=(
            "Filter by payment status, "
            "for example SUCCESS or REVERSED."
        ),
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=25,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    return get_fee_payment_audit_history(
        db=db,
        search=search,
        status=status,
        page=page,
        page_size=page_size,
    )