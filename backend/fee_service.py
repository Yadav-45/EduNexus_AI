from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from models.fee_structure import FeeStructure
from models.fee_fine_policy import FeeFinePolicy


def get_fee_structure_for_student(
    db: Session,
    class_name: str,
    academic_year: str,
) -> FeeStructure | None:

    fee_structure = (
        db.query(FeeStructure)
        .filter(
            FeeStructure.class_name == class_name,
            FeeStructure.academic_year == academic_year,
            FeeStructure.status == "ACTIVE",
        )
        .order_by(FeeStructure.id.desc())
        .first()
    )

    return fee_structure


def get_total_fee(
    db: Session,
    class_name: str,
    academic_year: str,
) -> Decimal:

    fee_structure = get_fee_structure_for_student(
        db=db,
        class_name=class_name,
        academic_year=academic_year,
    )

    if not fee_structure:
        raise ValueError(
            "No active fee structure found for "
            f"class {class_name} "
            f"and academic year {academic_year}."
        )

    return fee_structure.total_fee


def get_active_fee_fine_policy(
    db: Session,
    academic_year: str,
) -> FeeFinePolicy | None:

    policy = (
        db.query(FeeFinePolicy)
        .filter(
            FeeFinePolicy.academic_year == academic_year,
            FeeFinePolicy.status == "ACTIVE",
        )
        .order_by(
            FeeFinePolicy.id.desc()
        )
        .first()
    )

    if policy:
        return policy

    # Fall back to a generic active policy.
    return (
        db.query(FeeFinePolicy)
        .filter(
            FeeFinePolicy.academic_year.is_(None),
            FeeFinePolicy.status == "ACTIVE",
        )
        .order_by(
            FeeFinePolicy.id.desc()
        )
        .first()
    )


def calculate_fee_due_date(
    db: Session,
    academic_year: str,
    created_at: datetime | None = None,
) -> datetime | None:

    policy = get_active_fee_fine_policy(
        db=db,
        academic_year=academic_year,
    )

    if not policy:
        return None

    if created_at is None:
        created_at = datetime.now()

    return (
        created_at
        + timedelta(
            days=policy.due_after_days
        )
    )