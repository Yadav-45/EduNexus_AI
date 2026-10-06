from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from models.admission import Admission
from models.fee_account import FeeAccount
from models.school_intelligence_snapshot import SchoolIntelligenceSnapshot
from models.student import Student


def get_current_academic_year(db: Session) -> str | None:
    academic_year = (
        db.query(FeeAccount.academic_year)
        .filter(FeeAccount.academic_year.isnot(None))
        .order_by(FeeAccount.id.desc())
        .first()
    )

    if academic_year:
        return academic_year[0]

    student_year = (
        db.query(Student.academic_year)
        .filter(Student.academic_year.isnot(None))
        .order_by(Student.id.desc())
        .first()
    )

    if student_year:
        return student_year[0]

    return None


def calculate_school_intelligence(
    db: Session,
) -> dict:
    academic_year = get_current_academic_year(db)

    active_students = (
        db.query(Student)
        .filter(Student.status == "ACTIVE")
        .count()
    )

    inactive_students = (
        db.query(Student)
        .filter(Student.status != "ACTIVE")
        .count()
    )

    total_admissions = db.query(Admission).count()

    pending_admissions = (
        db.query(Admission)
        .filter(
            Admission.status.in_(
                [
                    "APPLIED",
                    "UNDER_REVIEW",
                    "APPROVED",
                ]
            )
        )
        .count()
    )

    enrolled_admissions = (
        db.query(Admission)
        .filter(
            Admission.status == "ENROLLED"
        )
        .count()
    )

    fee_query = db.query(FeeAccount).filter(
        FeeAccount.status == "ACTIVE"
    )

    if academic_year:
        fee_query = fee_query.filter(
            FeeAccount.academic_year == academic_year
        )

    fee_accounts = fee_query.all()

    total_fee_due = sum(
        (
            Decimal(account.total_due or 0)
            for account in fee_accounts
        ),
        Decimal("0.00"),
    )

    total_fee_paid = sum(
        (
            Decimal(account.total_paid or 0)
            for account in fee_accounts
        ),
        Decimal("0.00"),
    )

    total_fee_outstanding = sum(
        (
            Decimal(account.balance or 0)
            for account in fee_accounts
        ),
        Decimal("0.00"),
    )

    if total_fee_due > 0:
        fee_collection_rate = (
            total_fee_paid / total_fee_due
        ) * Decimal("100")
    else:
        fee_collection_rate = Decimal("0.00")

    fee_collection_rate = fee_collection_rate.quantize(
        Decimal("0.01")
    )

    return {
        "generated_at": datetime.now(timezone.utc),
        "academic_year": academic_year,
        "students": {
            "active": active_students,
            "inactive": inactive_students,
            "total": active_students + inactive_students,
        },
        "admissions": {
            "total": total_admissions,
            "pending": pending_admissions,
            "enrolled": enrolled_admissions,
        },
        "finance": {
            "total_due": total_fee_due,
            "total_paid": total_fee_paid,
            "total_outstanding": total_fee_outstanding,
            "collection_rate": fee_collection_rate,
        },
    }


def create_school_intelligence_snapshot(
    db: Session,
) -> SchoolIntelligenceSnapshot:
    intelligence = calculate_school_intelligence(db)

    snapshot = SchoolIntelligenceSnapshot(
        snapshot_date=intelligence["generated_at"],
        academic_year=intelligence["academic_year"],
        active_students=intelligence["students"]["active"],
        inactive_students=intelligence["students"]["inactive"],
        total_admissions=intelligence["admissions"]["total"],
        pending_admissions=intelligence["admissions"]["pending"],
        enrolled_admissions=intelligence["admissions"]["enrolled"],
        total_fee_due=intelligence["finance"]["total_due"],
        total_fee_paid=intelligence["finance"]["total_paid"],
        total_fee_outstanding=intelligence["finance"]["total_outstanding"],
        fee_collection_rate=intelligence["finance"]["collection_rate"],
        snapshot_type="DAILY",
    )

    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    return snapshot


def get_school_intelligence_history(
    db: Session,
    limit: int = 30,
) -> list[SchoolIntelligenceSnapshot]:
    return (
        db.query(SchoolIntelligenceSnapshot)
        .order_by(
            SchoolIntelligenceSnapshot.snapshot_date.desc()
        )
        .limit(limit)
        .all()
    )