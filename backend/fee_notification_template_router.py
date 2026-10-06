from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db

from fee_notification_template_schemas import (
    FeeNotificationTemplateCreate,
    FeeNotificationTemplateListResponse,
    FeeNotificationTemplateResponse,
)

from fee_notification_template_service import (
    create_notification_template,
    get_notification_template,
    list_notification_templates,
    update_notification_template,
)


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Notification Templates"],
)


@router.post(
    "/notification-templates",
    response_model=FeeNotificationTemplateResponse,
)
def create_template(
    data: FeeNotificationTemplateCreate,
    db: Session = Depends(get_db),
):

    try:
        return create_notification_template(
            db=db,
            data=data.model_dump(),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@router.get(
    "/notification-templates",
    response_model=FeeNotificationTemplateListResponse,
)
def list_templates(
    notification_type: str | None = Query(default=None),
    channel: str | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
):

    templates = list_notification_templates(
        db=db,
        notification_type=notification_type,
        channel=channel,
        status=status,
    )

    return {
        "data": templates,
        "total": len(templates),
    }


@router.get(
    "/notification-templates/{template_id}",
    response_model=FeeNotificationTemplateResponse,
)
def get_template(
    template_id: int,
    db: Session = Depends(get_db),
):

    try:
        return get_notification_template(
            db=db,
            template_id=template_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )


@router.put(
    "/notification-templates/{template_id}",
    response_model=FeeNotificationTemplateResponse,
)
def update_template(
    template_id: int,
    data: FeeNotificationTemplateCreate,
    db: Session = Depends(get_db),
):

    try:
        return update_notification_template(
            db=db,
            template_id=template_id,
            data=data.model_dump(),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )