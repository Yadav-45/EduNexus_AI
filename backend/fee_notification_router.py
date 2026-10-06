from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from fee_notification_schemas import FeeNotificationResponse
from fee_notification_service import get_fee_notifications


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Notifications"],
)


@router.get(
    "/notifications",
    response_model=FeeNotificationResponse,
)
def fee_notifications(
    academic_year: str | None = Query(
        default=None,
        max_length=20,
    ),
    notification_type: str | None = Query(
        default=None,
        max_length=50,
    ),
    db: Session = Depends(get_db),
):

    notifications = get_fee_notifications(
        db=db,
        academic_year=academic_year,
        notification_type=notification_type,
    )

    return {
        "data": notifications,
        "total": len(notifications),
    }