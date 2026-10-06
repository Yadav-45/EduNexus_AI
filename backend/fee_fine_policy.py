from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from models.fee_fine_policy import FeeFinePolicy


def validate_fine_policy(
    due_after_days: int,
    grace_period_days: int,
    fine_type: str,
    fine_value: Decimal,
    recurring_fine: bool,
    recurring_period_days: int,
):

    if due_after_days < 0:
        raise ValueError(
            "Due-after days cannot be negative."
        )

    if grace_period_days < 0:
        raise ValueError(
            "Grace period cannot be negative."
        )

    fine_type = fine_type.upper()

    if fine_type not in {"FIXED", "PERCENTAGE"}:
        raise ValueError(
            "Fine type must be FIXED or PERCENTAGE."
        )

    if fine_value < 0:
        raise ValueError(
            "Fine value cannot be negative."
        )

    if fine_type == "PERCENTAGE" and fine_value > 100:
        raise ValueError(
            "Percentage fine cannot exceed 100%."
        )

    if recurring_fine and recurring_period_days <= 0:
        raise ValueError(
            "Recurring period must be greater than zero."
        )


def calculate_late_fine(
    outstanding_amount: Decimal,
    days_overdue: int,
    grace_period_days: int,
    fine_type: str = "FIXED",
    fine_value: Decimal = Decimal("0.00"),
    recurring: bool = False,
    recurring_period_days: int = 30,
) -> Decimal:

    outstanding_amount = Decimal(
        outstanding_amount or 0
    )

    fine_value = Decimal(
        fine_value or 0
    )

    validate_fine_policy(
        due_after_days=0,
        grace_period_days=grace_period_days,
        fine_type=fine_type,
        fine_value=fine_value,
        recurring_fine=recurring,
        recurring_period_days=recurring_period_days,
    )

    if outstanding_amount <= 0:
        return Decimal("0.00")

    if days_overdue <= grace_period_days:
        return Decimal("0.00")

    overdue_after_grace = (
        days_overdue - grace_period_days
    )

    if recurring:
        periods = (
            overdue_after_grace
            // recurring_period_days
        ) + 1
    else:
        periods = 1

    if fine_type.upper() == "FIXED":
        fine = fine_value * periods

    else:
        fine = (
            outstanding_amount
            * fine_value
            / Decimal("100")
        ) * periods

    return fine.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def create_fee_fine_policy(
    db: Session,
    data: dict,
) -> FeeFinePolicy:

    validate_fine_policy(
        due_after_days=data["due_after_days"],
        grace_period_days=data["grace_period_days"],
        fine_type=data["fine_type"],
        fine_value=data["fine_value"],
        recurring_fine=data["recurring_fine"],
        recurring_period_days=data[
            "recurring_period_days"
        ],
    )

    existing = (
        db.query(FeeFinePolicy)
        .filter(
            FeeFinePolicy.name == data["name"],
            FeeFinePolicy.academic_year
            == data["academic_year"],
        )
        .first()
    )

    if existing:
        raise ValueError(
            "A fine policy with this name and academic year already exists."
        )

    policy = FeeFinePolicy(**data)

    db.add(policy)
    db.commit()
    db.refresh(policy)

    return policy


def update_fee_fine_policy(
    db: Session,
    policy_id: int,
    data: dict,
) -> FeeFinePolicy:

    policy = (
        db.query(FeeFinePolicy)
        .filter(FeeFinePolicy.id == policy_id)
        .first()
    )

    if not policy:
        raise ValueError(
            "Fee fine policy not found."
        )

    updated_values = {
        key: value
        for key, value in data.items()
        if value is not None
    }

    due_after_days = updated_values.get(
        "due_after_days",
        policy.due_after_days,
    )

    grace_period_days = updated_values.get(
        "grace_period_days",
        policy.grace_period_days,
    )

    fine_type = updated_values.get(
        "fine_type",
        policy.fine_type,
    )

    fine_value = updated_values.get(
        "fine_value",
        policy.fine_value,
    )

    recurring_fine = updated_values.get(
        "recurring_fine",
        policy.recurring_fine,
    )

    recurring_period_days = updated_values.get(
        "recurring_period_days",
        policy.recurring_period_days,
    )

    validate_fine_policy(
        due_after_days=due_after_days,
        grace_period_days=grace_period_days,
        fine_type=fine_type,
        fine_value=fine_value,
        recurring_fine=recurring_fine,
        recurring_period_days=recurring_period_days,
    )

    for key, value in updated_values.items():
        setattr(policy, key, value)

    db.commit()
    db.refresh(policy)

    return policy