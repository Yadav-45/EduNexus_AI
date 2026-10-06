from sqlalchemy.orm import Session

from models.fee_notification_template import FeeNotificationTemplate


def create_notification_template(
    db: Session,
    data: dict,
) -> FeeNotificationTemplate:

    existing = (
        db.query(FeeNotificationTemplate)
        .filter(
            FeeNotificationTemplate.name == data["name"]
        )
        .first()
    )

    if existing:
        raise ValueError(
            "A notification template with this name already exists."
        )

    if data.get("is_default"):

        db.query(FeeNotificationTemplate).filter(
            FeeNotificationTemplate.notification_type
            == data["notification_type"],
            FeeNotificationTemplate.channel
            == data["channel"],
        ).update(
            {"is_default": False},
            synchronize_session=False,
        )

    template = FeeNotificationTemplate(**data)

    db.add(template)
    db.commit()
    db.refresh(template)

    return template


def list_notification_templates(
    db: Session,
    notification_type: str | None = None,
    channel: str | None = None,
    status: str | None = None,
) -> list[FeeNotificationTemplate]:

    query = db.query(FeeNotificationTemplate)

    if notification_type:
        query = query.filter(
            FeeNotificationTemplate.notification_type
            == notification_type
        )

    if channel:
        query = query.filter(
            FeeNotificationTemplate.channel == channel
        )

    if status:
        query = query.filter(
            FeeNotificationTemplate.status == status
        )

    return query.order_by(
        FeeNotificationTemplate.id.asc()
    ).all()


def get_notification_template(
    db: Session,
    template_id: int,
) -> FeeNotificationTemplate:

    template = (
        db.query(FeeNotificationTemplate)
        .filter(
            FeeNotificationTemplate.id == template_id
        )
        .first()
    )

    if not template:
        raise ValueError(
            "Notification template not found."
        )

    return template


def update_notification_template(
    db: Session,
    template_id: int,
    data: dict,
) -> FeeNotificationTemplate:

    template = get_notification_template(
        db=db,
        template_id=template_id,
    )

    updated_values = {
        key: value
        for key, value in data.items()
        if value is not None
    }

    notification_type = updated_values.get(
        "notification_type",
        template.notification_type,
    )

    channel = updated_values.get(
        "channel",
        template.channel,
    )

    if updated_values.get("is_default"):

        db.query(FeeNotificationTemplate).filter(
            FeeNotificationTemplate.notification_type
            == notification_type,
            FeeNotificationTemplate.channel
            == channel,
            FeeNotificationTemplate.id != template_id,
        ).update(
            {"is_default": False},
            synchronize_session=False,
        )

    for key, value in updated_values.items():
        setattr(template, key, value)

    db.commit()
    db.refresh(template)

    return template