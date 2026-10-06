from decimal import Decimal
from sqlalchemy.orm import Session

from models.school_intelligence_snapshot import SchoolIntelligenceSnapshot


def _percentage_change(current, previous):
    if previous is None:
        return None

    current = Decimal(str(current))
    previous = Decimal(str(previous))

    if previous == 0:
        return None

    return float(
        ((current - previous) / previous * Decimal("100")).quantize(
            Decimal("0.01")
        )
    )


def _direction(change):
    if change is None:
        return "INSUFFICIENT_DATA"

    if change > 0:
        return "INCREASING"

    if change < 0:
        return "DECREASING"

    return "STABLE"


def get_school_trends(
    db: Session,
    limit: int = 30,
) -> dict:
    snapshots = (
        db.query(SchoolIntelligenceSnapshot)
        .order_by(
            SchoolIntelligenceSnapshot.snapshot_date.asc()
        )
        .limit(limit)
        .all()
    )

    if not snapshots:
        return {
            "success": True,
            "snapshot_count": 0,
            "status": "INSUFFICIENT_DATA",
            "trends": {},
        }

    latest = snapshots[-1]

    if len(snapshots) < 2:
        return {
            "success": True,
            "snapshot_count": len(snapshots),
            "status": "INSUFFICIENT_DATA",
            "trends": {
                "students": {
                    "change": None,
                    "percentage_change": None,
                    "direction": "INSUFFICIENT_DATA",
                },
                "admissions": {
                    "change": None,
                    "percentage_change": None,
                    "direction": "INSUFFICIENT_DATA",
                },
                "fee_paid": {
                    "change": None,
                    "percentage_change": None,
                    "direction": "INSUFFICIENT_DATA",
                },
                "outstanding": {
                    "change": None,
                    "percentage_change": None,
                    "direction": "INSUFFICIENT_DATA",
                },
                "collection_rate": {
                    "change": None,
                    "percentage_change": None,
                    "direction": "INSUFFICIENT_DATA",
                },
            },
        }

    previous = snapshots[-2]

    student_change = (
        latest.active_students - previous.active_students
    )

    admission_change = (
        latest.total_admissions
        - previous.total_admissions
    )

    fee_paid_change = (
        latest.total_fee_paid
        - previous.total_fee_paid
    )

    outstanding_change = (
        latest.total_fee_outstanding
        - previous.total_fee_outstanding
    )

    collection_rate_change = (
        latest.fee_collection_rate
        - previous.fee_collection_rate
    )

    return {
        "success": True,
        "snapshot_count": len(snapshots),
        "status": "READY",
        "latest_snapshot": {
            "id": latest.id,
            "date": latest.snapshot_date,
            "academic_year": latest.academic_year,
        },
        "previous_snapshot": {
            "id": previous.id,
            "date": previous.snapshot_date,
            "academic_year": previous.academic_year,
        },
        "trends": {
            "students": {
                "change": student_change,
                "percentage_change": _percentage_change(
                    latest.active_students,
                    previous.active_students,
                ),
                "direction": _direction(student_change),
            },
            "admissions": {
                "change": admission_change,
                "percentage_change": _percentage_change(
                    latest.total_admissions,
                    previous.total_admissions,
                ),
                "direction": _direction(admission_change),
            },
            "fee_paid": {
                "change": float(fee_paid_change),
                "percentage_change": _percentage_change(
                    latest.total_fee_paid,
                    previous.total_fee_paid,
                ),
                "direction": _direction(fee_paid_change),
            },
            "outstanding": {
                "change": float(outstanding_change),
                "percentage_change": _percentage_change(
                    latest.total_fee_outstanding,
                    previous.total_fee_outstanding,
                ),
                "direction": _direction(outstanding_change),
            },
            "collection_rate": {
                "change": float(collection_rate_change),
                "percentage_change": _percentage_change(
                    latest.fee_collection_rate,
                    previous.fee_collection_rate,
                ),
                "direction": _direction(collection_rate_change),
            },
        },
    }