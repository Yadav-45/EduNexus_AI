from datetime import datetime

from sqlalchemy.orm import Session

from models.fee_account import FeeAccount
from models.fee_fine import FeeFine
from models.parent import Parent
from models.parent_student import ParentStudent
from models.student import Student


def get_fee_notifications(
    db: Session,
    academic_year: str | None = None,
    notification_type: str | None = None,
) -> list[dict]:

    query = (
        db.query(FeeAccount, Student)
        .join(Student, Student.id == FeeAccount.student_id)
        .filter(FeeAccount.status == "ACTIVE")
    )

    if academic_year:
        query = query.filter(
            FeeAccount.academic_year == academic_year
        )

    results = query.order_by(
        FeeAccount.due_date.asc(),
        Student.first_name.asc(),
    ).all()

    now = datetime.now()
    notifications = []

    for fee_account, student in results:

        outstanding = float(fee_account.balance or 0)

        if outstanding <= 0:
            continue

        fine_amount = (
            db.query(FeeFine)
            .filter(
                FeeFine.fee_account_id == fee_account.id,
                FeeFine.status == "ACTIVE",
            )
            .with_entities(FeeFine.amount)
            .all()
        )

        total_fine = sum(
            float(item[0] or 0)
            for item in fine_amount
        )

        days_overdue = 0
        notification_kind = "UPCOMING_DUE"

        if fee_account.due_date:

            due_date = fee_account.due_date

            if due_date.tzinfo:
                now_compare = now.astimezone(due_date.tzinfo)
            else:
                now_compare = now

            if due_date < now_compare:

                days_overdue = (
                    now_compare.date() - due_date.date()
                ).days

                notification_kind = "OVERDUE"

            else:

                days_until_due = (
                    due_date.date() - now_compare.date()
                ).days

                if days_until_due <= 7:
                    notification_kind = "DUE_SOON"
                else:
                    notification_kind = "UPCOMING_DUE"

        else:
            notification_kind = "NO_DUE_DATE"

        if total_fine > 0:
            notification_kind = "OVERDUE_WITH_FINE"

        if notification_type:
            if notification_kind != notification_type:
                continue

        parent_phone = None
        parent_email = None

        parent_link = (
            db.query(ParentStudent)
            .filter(
                ParentStudent.student_id == student.id,
                ParentStudent.status == "ACTIVE",
            )
            .order_by(ParentStudent.id.asc())
            .first()
        )

        if parent_link:

            parent = (
                db.query(Parent)
                .filter(
                    Parent.id == parent_link.parent_id,
                    Parent.status == "ACTIVE",
                )
                .first()
            )

            if parent:
                parent_phone = parent.phone
                parent_email = parent.email

        if notification_kind == "OVERDUE_WITH_FINE":

            message = (
                f"Fee payment reminder for {student.first_name} "
                f"{student.last_name or ''}. "
                f"Outstanding fee: ₹{outstanding:.2f}. "
                f"Late fine: ₹{total_fine:.2f}. "
                f"Please clear the outstanding amount."
            )

        elif notification_kind == "OVERDUE":

            message = (
                f"Fee payment reminder for {student.first_name} "
                f"{student.last_name or ''}. "
                f"Outstanding fee: ₹{outstanding:.2f}. "
                f"Payment is overdue by {days_overdue} day(s). "
                f"Please clear the outstanding amount."
            )

        elif notification_kind == "DUE_SOON":

            days_until_due = (
                fee_account.due_date.date()
                - now_compare.date()
            ).days

            message = (
                f"Fee payment reminder for {student.first_name} "
                f"{student.last_name or ''}. "
                f"Outstanding fee: ₹{outstanding:.2f}. "
                f"Payment is due in {days_until_due} day(s)."
            )

        elif notification_kind == "NO_DUE_DATE":

            message = (
                f"Fee payment reminder for {student.first_name} "
                f"{student.last_name or ''}. "
                f"Outstanding fee: ₹{outstanding:.2f}. "
                f"No due date is currently configured."
            )

        else:

            message = (
                f"Fee payment reminder for {student.first_name} "
                f"{student.last_name or ''}. "
                f"Outstanding fee: ₹{outstanding:.2f}. "
                f"Please complete the payment before the due date."
            )

        notifications.append(
            {
                "fee_account_id": fee_account.id,
                "student_id": student.id,
                "student_name": (
                    f"{student.first_name} "
                    f"{student.last_name or ''}"
                ).strip(),
                "academic_year": fee_account.academic_year,
                "notification_type": notification_kind,
                "total_due": fee_account.total_due or 0,
                "total_paid": fee_account.total_paid or 0,
                "outstanding_amount": outstanding,
                "fine_amount": total_fine,
                "due_date": (
                    fee_account.due_date.isoformat()
                    if fee_account.due_date
                    else None
                ),
                "days_overdue": days_overdue,
                "parent_phone": parent_phone,
                "parent_email": parent_email,
                "message": message,
            }
        )

    return notifications