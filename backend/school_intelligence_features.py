from decimal import Decimal
from sqlalchemy.orm import Session

from models.school_intelligence_snapshot import SchoolIntelligenceSnapshot


def _percentage_change(current, previous):
    if previous is None:
        return None

    previous = Decimal(str(previous))
    current = Decimal(str(current))

    if previous == 0:
        return None

    return ((current - previous) / previous * Decimal("100")).quantize(
        Decimal("0.01")
    )


def get_intelligence_features(
    db: Session,
    limit: int = 30,
) -> dict:
    snapshots = (
        db.query(SchoolIntelligenceSnapshot)
        .order_by(SchoolIntelligenceSnapshot.snapshot_date.desc())
        .limit(limit)
        .all()
    )

    if not snapshots:
        return {
            "snapshot_count": 0,
            "latest": None,
            "previous": None,
            "trends": {},
            "ml_features": {},
        }

    latest = snapshots[0]
    previous = snapshots[1] if len(snapshots) > 1 else None

    trends = {
        "active_students_change": (
            latest.active_students - previous.active_students
            if previous
            else None
        ),
        "active_students_percentage": (
            _percentage_change(
                latest.active_students,
                previous.active_students,
            )
            if previous
            else None
        ),
        "admissions_change": (
            latest.total_admissions - previous.total_admissions
            if previous
            else None
        ),
        "admissions_percentage": (
            _percentage_change(
                latest.total_admissions,
                previous.total_admissions,
            )
            if previous
            else None
        ),
        "fee_paid_change": (
            latest.total_fee_paid - previous.total_fee_paid
            if previous
            else None
        ),
        "fee_paid_percentage": (
            _percentage_change(
                latest.total_fee_paid,
                previous.total_fee_paid,
            )
            if previous
            else None
        ),
        "outstanding_change": (
            latest.total_fee_outstanding
            - previous.total_fee_outstanding
            if previous
            else None
        ),
        "outstanding_percentage": (
            _percentage_change(
                latest.total_fee_outstanding,
                previous.total_fee_outstanding,
            )
            if previous
            else None
        ),
        "collection_rate_change": (
            latest.fee_collection_rate
            - previous.fee_collection_rate
            if previous
            else None
        ),
    }

    ml_features = {
        "active_students": latest.active_students,
        "inactive_students": latest.inactive_students,
        "total_students": (
            latest.active_students + latest.inactive_students
        ),
        "total_admissions": latest.total_admissions,
        "pending_admissions": latest.pending_admissions,
        "enrolled_admissions": latest.enrolled_admissions,
        "total_fee_due": float(latest.total_fee_due),
        "total_fee_paid": float(latest.total_fee_paid),
        "total_fee_outstanding": float(
            latest.total_fee_outstanding
        ),
        "fee_collection_rate": float(
            latest.fee_collection_rate
        ),
        "pending_admission_ratio": (
            latest.pending_admissions
            / latest.total_admissions
            if latest.total_admissions > 0
            else 0
        ),
        "enrollment_ratio": (
            latest.enrolled_admissions
            / latest.total_admissions
            if latest.total_admissions > 0
            else 0
        ),
        "outstanding_fee_ratio": (
            float(latest.total_fee_outstanding)
            / float(latest.total_fee_due)
            if latest.total_fee_due > 0
            else 0
        ),
    }

    return {
        "snapshot_count": len(snapshots),
        "latest": {
            "id": latest.id,
            "snapshot_date": latest.snapshot_date,
            "academic_year": latest.academic_year,
        },
        "previous": (
            {
                "id": previous.id,
                "snapshot_date": previous.snapshot_date,
            }
            if previous
            else None
        ),
        "trends": trends,
        "ml_features": ml_features,
    }