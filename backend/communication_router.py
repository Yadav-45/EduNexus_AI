from datetime import datetime, timezone
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db
from models.user import User
from models.student import Student
from models.communication_notice import CommunicationNotice
from models.communication_recipient import CommunicationRecipient

from communication_schemas import (
    CommunicationNoticeCreate,
    CommunicationNoticeUpdate,
    CommunicationNoticeStatusUpdate,
    CommunicationNoticeResponse,
    CommunicationNoticeListResponse,
    CommunicationRecipientResponse,
    CommunicationRecipientListResponse,
    CommunicationReadResponse,
    CommunicationDashboardResponse,
    NOTICE_TYPES,
    NOTICE_PRIORITIES,
    NOTICE_STATUSES,
    TARGET_TYPES,
    DELIVERY_STATUSES,
)


router = APIRouter(
    prefix="/communication",
    tags=["Communication Management"],
)


ALLOWED_ROLES = (
    "OWNER",
    "ADMIN",
    "TEACHER",
)


# ============================================================
# HELPERS
# ============================================================

def get_total_pages(total: int, page_size: int) -> int:
    if total == 0:
        return 0

    return ceil(total / page_size)


def generate_notice_number(db: Session) -> str:
    year = datetime.now().year

    prefix = f"NOTICE-{year}-"

    last_notice = (
        db.query(CommunicationNotice)
        .filter(
            CommunicationNotice.notice_number.like(
                f"{prefix}%"
            )
        )
        .order_by(
            CommunicationNotice.id.desc()
        )
        .first()
    )

    if last_notice:
        try:
            last_number = int(
                last_notice.notice_number.split("-")[-1]
            )
        except (ValueError, IndexError):
            last_number = 0
    else:
        last_number = 0

    return f"{prefix}{last_number + 1:06d}"


def validate_notice_data(
    notice_type: str,
    priority: str,
    target_type: str,
):
    notice_type = notice_type.upper()
    priority = priority.upper()
    target_type = target_type.upper()

    if notice_type not in NOTICE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid notice type. "
                f"Allowed values: {sorted(NOTICE_TYPES)}"
            ),
        )

    if priority not in NOTICE_PRIORITIES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid priority. "
                f"Allowed values: {sorted(NOTICE_PRIORITIES)}"
            ),
        )

    if target_type not in TARGET_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid target type. "
                f"Allowed values: {sorted(TARGET_TYPES)}"
            ),
        )


def get_target_users(
    db: Session,
    target_type: str,
    target_class: str | None = None,
    target_section: str | None = None,
):
    target_type = target_type.upper()

    query = db.query(User).filter(
        User.is_active == True
    )

    if target_type == "ALL":
        return query.all()

    if target_type == "STUDENTS":
        student_user_ids = (
            db.query(Student.user_id)
            .filter(
                Student.user_id.isnot(None),
                Student.status == "ACTIVE",
            )
            .subquery()
        )

        return (
            query.filter(
                User.id.in_(student_user_ids)
            )
            .all()
        )

    if target_type == "PARENTS":
        return (
            query.filter(
                User.role == "PARENT"
            )
            .all()
        )

    if target_type == "TEACHERS":
        return (
            query.filter(
                User.role == "TEACHER"
            )
            .all()
        )

    if target_type == "STAFF":
        return (
            query.filter(
                User.role.in_(
                    [
                        "OWNER",
                        "ADMIN",
                        "ACCOUNTANT",
                        "TEACHER",
                    ]
                )
            )
            .all()
        )

    if target_type in {"CLASS", "SECTION"}:
        student_query = (
            db.query(Student.user_id)
            .filter(
                Student.user_id.isnot(None),
                Student.status == "ACTIVE",
            )
        )

        if target_class:
            student_query = student_query.filter(
                Student.class_name == target_class
            )

        if target_section:
            student_query = student_query.filter(
                Student.section == target_section
            )

        student_user_ids = student_query.subquery()

        student_users = (
            query.filter(
                User.id.in_(student_user_ids)
            )
            .all()
        )

        # Include parents linked to students in the
        # selected class/section.
        student_ids_query = (
            db.query(Student.id)
            .filter(
                Student.status == "ACTIVE"
            )
        )

        if target_class:
            student_ids_query = student_ids_query.filter(
                Student.class_name == target_class
            )

        if target_section:
            student_ids_query = student_ids_query.filter(
                Student.section == target_section
            )

        student_ids = [
            row[0]
            for row in student_ids_query.all()
        ]

        parent_user_ids = []

        if student_ids:
            from models.parent_student import ParentStudent
            from models.parent import Parent

            parent_user_query = (
                db.query(Parent.user_id)
                .join(
                    ParentStudent,
                    ParentStudent.parent_id == Parent.id,
                )
                .filter(
                    Parent.user_id.isnot(None),
                    ParentStudent.student_id.in_(
                        student_ids
                    ),
                    Parent.status == "ACTIVE",
                )
                .all()
            )

            parent_user_ids = [
                row[0]
                for row in parent_user_query
                if row[0] is not None
            ]

        combined_user_ids = [
            user.id
            for user in student_users
        ]

        combined_user_ids.extend(
            parent_user_ids
        )

        if not combined_user_ids:
            return []

        return (
            query.filter(
                User.id.in_(
                    list(set(combined_user_ids))
                )
            )
            .all()
        )

    return []


# ============================================================
# DASHBOARD
# ============================================================

@router.get(
    "/dashboard",
    response_model=CommunicationDashboardResponse,
)
def communication_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "TEACHER",
        )
    ),
):
    total_notices = (
        db.query(CommunicationNotice)
        .count()
    )

    draft_notices = (
        db.query(CommunicationNotice)
        .filter(
            CommunicationNotice.status == "DRAFT"
        )
        .count()
    )

    scheduled_notices = (
        db.query(CommunicationNotice)
        .filter(
            CommunicationNotice.status == "SCHEDULED"
        )
        .count()
    )

    published_notices = (
        db.query(CommunicationNotice)
        .filter(
            CommunicationNotice.status == "PUBLISHED"
        )
        .count()
    )

    archived_notices = (
        db.query(CommunicationNotice)
        .filter(
            CommunicationNotice.status == "ARCHIVED"
        )
        .count()
    )

    active_notices = (
        db.query(CommunicationNotice)
        .filter(
            CommunicationNotice.is_active == True
        )
        .count()
    )

    total_recipients = (
        db.query(CommunicationRecipient)
        .count()
    )

    unread_recipients = (
        db.query(CommunicationRecipient)
        .filter(
            CommunicationRecipient.is_read == False
        )
        .count()
    )

    read_recipients = (
        db.query(CommunicationRecipient)
        .filter(
            CommunicationRecipient.is_read == True
        )
        .count()
    )

    failed_recipients = (
        db.query(CommunicationRecipient)
        .filter(
            CommunicationRecipient.delivery_status
            == "FAILED"
        )
        .count()
    )

    return CommunicationDashboardResponse(
        total_notices=total_notices,
        draft_notices=draft_notices,
        scheduled_notices=scheduled_notices,
        published_notices=published_notices,
        archived_notices=archived_notices,
        active_notices=active_notices,
        total_recipients=total_recipients,
        unread_recipients=unread_recipients,
        read_recipients=read_recipients,
        failed_recipients=failed_recipients,
    )


# ============================================================
# CREATE NOTICE
# ============================================================

@router.post(
    "/notices",
    response_model=CommunicationNoticeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_notice(
    data: CommunicationNoticeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "TEACHER",
        )
    ),
):
    validate_notice_data(
        data.notice_type,
        data.priority,
        data.target_type,
    )

    if data.target_type.upper() == "CLASS":
        if not data.target_class:
            raise HTTPException(
                status_code=400,
                detail=(
                    "target_class is required "
                    "for CLASS notices."
                ),
            )

    if data.target_type.upper() == "SECTION":
        if not data.target_class:
            raise HTTPException(
                status_code=400,
                detail=(
                    "target_class is required "
                    "for SECTION notices."
                ),
            )

        if not data.target_section:
            raise HTTPException(
                status_code=400,
                detail=(
                    "target_section is required "
                    "for SECTION notices."
                ),
            )

    if (
        data.publish_at
        and data.expires_at
        and data.expires_at <= data.publish_at
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "expires_at must be later "
                "than publish_at."
            ),
        )

    notice = CommunicationNotice(
        notice_number=generate_notice_number(db),
        title=data.title.strip(),
        message=data.message.strip(),
        notice_type=data.notice_type.upper(),
        priority=data.priority.upper(),
        target_type=data.target_type.upper(),
        target_class=data.target_class,
        target_section=data.target_section,
        publish_at=data.publish_at,
        expires_at=data.expires_at,
        status="DRAFT",
        is_active=True,
        created_by=current_user.id,
    )

    db.add(notice)
    db.commit()
    db.refresh(notice)

    return notice


# ============================================================
# LIST NOTICES
# ============================================================

@router.get(
    "/notices",
    response_model=CommunicationNoticeListResponse,
)
def list_notices(
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    search: str | None = Query(
        None,
        max_length=100,
    ),
    notice_type: str | None = None,
    priority: str | None = None,
    notice_status: str | None = None,
    target_type: str | None = None,
    is_active: bool | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "TEACHER",
        )
    ),
):
    query = db.query(
        CommunicationNotice
    )

    if search:
        search_value = (
            f"%{search.strip()}%"
        )

        query = query.filter(
            or_(
                CommunicationNotice.notice_number.ilike(
                    search_value
                ),
                CommunicationNotice.title.ilike(
                    search_value
                ),
                CommunicationNotice.message.ilike(
                    search_value
                ),
            )
        )

    if notice_type:
        query = query.filter(
            CommunicationNotice.notice_type
            == notice_type.upper()
        )

    if priority:
        query = query.filter(
            CommunicationNotice.priority
            == priority.upper()
        )

    if notice_status:
        query = query.filter(
            CommunicationNotice.status
            == notice_status.upper()
        )

    if target_type:
        query = query.filter(
            CommunicationNotice.target_type
            == target_type.upper()
        )

    if is_active is not None:
        query = query.filter(
            CommunicationNotice.is_active
            == is_active
        )

    total = query.count()

    notices = (
        query.order_by(
            CommunicationNotice.id.desc()
        )
        .offset(
            (page - 1) * page_size
        )
        .limit(page_size)
        .all()
    )

    return CommunicationNoticeListResponse(
        items=notices,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=get_total_pages(
            total,
            page_size,
        ),
    )


# ============================================================
# GET NOTICE
# ============================================================

@router.get(
    "/notices/{notice_id}",
    response_model=CommunicationNoticeResponse,
)
def get_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "TEACHER",
        )
    ),
):
    notice = (
        db.query(CommunicationNotice)
        .filter(
            CommunicationNotice.id
            == notice_id
        )
        .first()
    )

    if not notice:
        raise HTTPException(
            status_code=404,
            detail="Communication notice not found.",
        )

    return notice


# ============================================================
# UPDATE NOTICE
# ============================================================

@router.put(
    "/notices/{notice_id}",
    response_model=CommunicationNoticeResponse,
)
def update_notice(
    notice_id: int,
    data: CommunicationNoticeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "TEACHER",
        )
    ),
):
    notice = (
        db.query(CommunicationNotice)
        .filter(
            CommunicationNotice.id
            == notice_id
        )
        .first()
    )

    if not notice:
        raise HTTPException(
            status_code=404,
            detail="Communication notice not found.",
        )

    if notice.status in {
        "PUBLISHED",
        "ARCHIVED",
    }:
        raise HTTPException(
            status_code=400,
            detail=(
                "Published or archived notices "
                "cannot be edited."
            ),
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "notice_type" in update_data:
        update_data["notice_type"] = (
            update_data["notice_type"].upper()
        )

    if "priority" in update_data:
        update_data["priority"] = (
            update_data["priority"].upper()
        )

    if "target_type" in update_data:
        update_data["target_type"] = (
            update_data["target_type"].upper()
        )

    validate_notice_data(
        update_data.get(
            "notice_type",
            notice.notice_type,
        ),
        update_data.get(
            "priority",
            notice.priority,
        ),
        update_data.get(
            "target_type",
            notice.target_type,
        ),
    )

    for field, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()

        setattr(
            notice,
            field,
            value,
        )

    if (
        notice.publish_at
        and notice.expires_at
        and notice.expires_at
        <= notice.publish_at
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "expires_at must be later "
                "than publish_at."
            ),
        )

    db.commit()
    db.refresh(notice)

    return notice


# ============================================================
# UPDATE STATUS
# ============================================================

@router.patch(
    "/notices/{notice_id}/status",
    response_model=CommunicationNoticeResponse,
)
def update_notice_status(
    notice_id: int,
    data: CommunicationNoticeStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "TEACHER",
        )
    ),
):
    notice = (
        db.query(CommunicationNotice)
        .filter(
            CommunicationNotice.id
            == notice_id
        )
        .first()
    )

    if not notice:
        raise HTTPException(
            status_code=404,
            detail="Communication notice not found.",
        )

    new_status = data.status.upper()

    if new_status not in NOTICE_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid status. "
                f"Allowed values: "
                f"{sorted(NOTICE_STATUSES)}"
            ),
        )

    # Published notices should not be moved
    # backwards into draft.
    if (
        notice.status == "PUBLISHED"
        and new_status == "DRAFT"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Published notices cannot "
                "be changed back to DRAFT."
            ),
        )

    if new_status == "PUBLISHED":
        if not notice.title.strip():
            raise HTTPException(
                status_code=400,
                detail="Notice title is required.",
            )

        if not notice.message.strip():
            raise HTTPException(
                status_code=400,
                detail="Notice message is required.",
            )

        recipients = get_target_users(
            db=db,
            target_type=notice.target_type,
            target_class=notice.target_class,
            target_section=notice.target_section,
        )

        notice.published_by = current_user.id
        notice.published_at = datetime.now(
            timezone.utc
        )

        notice.status = "PUBLISHED"
        notice.is_active = True

        existing_recipient_user_ids = {
            row[0]
            for row in (
                db.query(
                    CommunicationRecipient
                    .recipient_user_id
                )
                .filter(
                    CommunicationRecipient.notice_id
                    == notice.id
                )
                .all()
            )
        }

        for recipient_user in recipients:
            if (
                recipient_user.id
                in existing_recipient_user_ids
            ):
                continue

            recipient = CommunicationRecipient(
                notice_id=notice.id,
                recipient_user_id=recipient_user.id,
                recipient_role=recipient_user.role,
                delivery_status="PENDING",
                is_read=False,
            )

            db.add(recipient)

    elif new_status == "SCHEDULED":
        if not notice.publish_at:
            raise HTTPException(
                status_code=400,
                detail=(
                    "publish_at is required "
                    "for scheduled notices."
                ),
            )

        notice.status = "SCHEDULED"

    elif new_status == "ARCHIVED":
        notice.status = "ARCHIVED"
        notice.is_active = False

    else:
        notice.status = new_status

    db.commit()
    db.refresh(notice)

    return notice


# ============================================================
# ARCHIVE NOTICE
# ============================================================

@router.delete(
    "/notices/{notice_id}",
    response_model=CommunicationNoticeResponse,
)
def archive_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    notice = (
        db.query(CommunicationNotice)
        .filter(
            CommunicationNotice.id
            == notice_id
        )
        .first()
    )

    if not notice:
        raise HTTPException(
            status_code=404,
            detail="Communication notice not found.",
        )

    notice.status = "ARCHIVED"
    notice.is_active = False

    db.commit()
    db.refresh(notice)

    return notice


# ============================================================
# RESTORE NOTICE
# ============================================================

@router.patch(
    "/notices/{notice_id}/restore",
    response_model=CommunicationNoticeResponse,
)
def restore_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    notice = (
        db.query(CommunicationNotice)
        .filter(
            CommunicationNotice.id
            == notice_id
        )
        .first()
    )

    if not notice:
        raise HTTPException(
            status_code=404,
            detail="Communication notice not found.",
        )

    if notice.status != "ARCHIVED":
        raise HTTPException(
            status_code=400,
            detail=(
                "Only archived notices "
                "can be restored."
            ),
        )

    notice.status = "DRAFT"
    notice.is_active = True

    db.commit()
    db.refresh(notice)

    return notice


# ============================================================
# NOTICE RECIPIENTS
# ============================================================

@router.get(
    "/notices/{notice_id}/recipients",
    response_model=CommunicationRecipientListResponse,
)
def list_notice_recipients(
    notice_id: int,
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    search: str | None = Query(
        None,
        max_length=100,
    ),
    delivery_status: str | None = None,
    is_read: bool | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "TEACHER",
        )
    ),
):
    notice = (
        db.query(CommunicationNotice)
        .filter(
            CommunicationNotice.id
            == notice_id
        )
        .first()
    )

    if not notice:
        raise HTTPException(
            status_code=404,
            detail="Communication notice not found.",
        )

    query = (
        db.query(CommunicationRecipient)
        .join(
            User,
            User.id
            == CommunicationRecipient.recipient_user_id,
        )
        .filter(
            CommunicationRecipient.notice_id
            == notice_id
        )
    )

    if search:
        search_value = (
            f"%{search.strip()}%"
        )

        query = query.filter(
            or_(
                User.full_name.ilike(
                    search_value
                ),
                User.email.ilike(
                    search_value
                ),
                User.role.ilike(
                    search_value
                ),
            )
        )

    if delivery_status:
        delivery_status = (
            delivery_status.upper()
        )

        if delivery_status not in DELIVERY_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid delivery status. "
                    f"Allowed values: "
                    f"{sorted(DELIVERY_STATUSES)}"
                ),
            )

        query = query.filter(
            CommunicationRecipient.delivery_status
            == delivery_status
        )

    if is_read is not None:
        query = query.filter(
            CommunicationRecipient.is_read
            == is_read
        )

    total = query.count()

    recipients = (
        query.order_by(
            CommunicationRecipient.id.desc()
        )
        .offset(
            (page - 1) * page_size
        )
        .limit(page_size)
        .all()
    )

    return CommunicationRecipientListResponse(
        items=recipients,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=get_total_pages(
            total,
            page_size,
        ),
    )


# ============================================================
# USER NOTIFICATIONS
# ============================================================

@router.get(
    "/my-notices",
    response_model=CommunicationRecipientListResponse,
)
def my_notices(
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
            "TEACHER",
            "PARENT",
            "STUDENT",
        )
    ),
):
    query = db.query(
        CommunicationRecipient
    ).filter(
        CommunicationRecipient.recipient_user_id
        == current_user.id
    )

    if unread_only:
        query = query.filter(
            CommunicationRecipient.is_read
            == False
        )

    total = query.count()

    recipients = (
        query.order_by(
            CommunicationRecipient.id.desc()
        )
        .offset(
            (page - 1) * page_size
        )
        .limit(page_size)
        .all()
    )

    return CommunicationRecipientListResponse(
        items=recipients,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=get_total_pages(
            total,
            page_size,
        ),
    )


# ============================================================
# MARK NOTICE AS READ
# ============================================================

@router.patch(
    "/recipients/{recipient_id}/read",
    response_model=CommunicationReadResponse,
)
def mark_recipient_as_read(
    recipient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
            "TEACHER",
            "PARENT",
            "STUDENT",
        )
    ),
):
    recipient = (
        db.query(CommunicationRecipient)
        .filter(
            CommunicationRecipient.id
            == recipient_id
        )
        .first()
    )

    if not recipient:
        raise HTTPException(
            status_code=404,
            detail="Communication recipient record not found.",
        )

    if (
        recipient.recipient_user_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "You cannot modify "
                "another user's notification."
            ),
        )

    now = datetime.now(timezone.utc)

    recipient.is_read = True
    recipient.read_at = now

    if recipient.delivery_status == "PENDING":
        recipient.delivery_status = "DELIVERED"
        recipient.delivered_at = now

    db.commit()
    db.refresh(recipient)

    return CommunicationReadResponse(
        message="Notice marked as read.",
        notice_id=recipient.notice_id,
        recipient_id=recipient.id,
        is_read=recipient.is_read,
        read_at=recipient.read_at,
    )


# ============================================================
# MARK AS UNREAD
# ============================================================

@router.patch(
    "/recipients/{recipient_id}/unread",
    response_model=CommunicationReadResponse,
)
def mark_recipient_as_unread(
    recipient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
            "TEACHER",
            "PARENT",
            "STUDENT",
        )
    ),
):
    recipient = (
        db.query(CommunicationRecipient)
        .filter(
            CommunicationRecipient.id
            == recipient_id
        )
        .first()
    )

    if not recipient:
        raise HTTPException(
            status_code=404,
            detail="Communication recipient record not found.",
        )

    if (
        recipient.recipient_user_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "You cannot modify "
                "another user's notification."
            ),
        )

    recipient.is_read = False
    recipient.read_at = None

    db.commit()
    db.refresh(recipient)

    return CommunicationReadResponse(
        message="Notice marked as unread.",
        notice_id=recipient.notice_id,
        recipient_id=recipient.id,
        is_read=False,
        read_at=None,
    )