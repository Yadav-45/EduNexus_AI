from decimal import Decimal

from sqlalchemy.orm import Session

from models.fee_fine import FeeFine
from models.fee_fine_adjustment import FeeFineAdjustment


def adjust_fee_fine(
    db: Session,
    fee_fine_id: int,
    adjusted_amount: Decimal,
    adjustment_type: str,
    reason: str,
    current_user_id: int,
) -> dict:

    fine = (
        db.query(FeeFine)
        .filter(FeeFine.id == fee_fine_id)
        .first()
    )

    if not fine:
        raise ValueError("Fee fine not found.")

    adjusted_amount = Decimal(adjusted_amount)
    original_amount = Decimal(fine.amount)

    if adjusted_amount < 0:
        raise ValueError(
            "Adjusted amount cannot be negative."
        )

    if adjusted_amount > original_amount:
        raise ValueError(
            "Adjusted amount cannot exceed the original fine."
        )

    if not reason.strip():
        raise ValueError(
            "Adjustment reason is required."
        )

    previous_adjustments = (
        db.query(FeeFineAdjustment)
        .filter(
            FeeFineAdjustment.fee_fine_id == fee_fine_id
        )
        .all()
    )

    already_adjusted = sum(
        (
            Decimal(item.adjusted_amount)
            for item in previous_adjustments
        ),
        Decimal("0.00"),
    )

    remaining_before = (
        original_amount - already_adjusted
    )

    if adjusted_amount > remaining_before:
        raise ValueError(
            "Adjustment exceeds the remaining fine amount."
        )

    adjustment = FeeFineAdjustment(
        fee_fine_id=fee_fine_id,
        adjusted_amount=adjusted_amount,
        adjustment_type=adjustment_type,
        reason=reason.strip(),
        adjusted_by_user_id=current_user_id,
    )

    db.add(adjustment)

    new_remaining = (
        remaining_before - adjusted_amount
    )

    if new_remaining == 0:
        fine.status = "WAIVED"

    db.commit()

    return {
        "success": True,
        "fee_fine_id": fee_fine_id,
        "original_amount": original_amount,
        "adjusted_amount": adjusted_amount,
        "remaining_fine": new_remaining,
        "adjustment_type": adjustment_type,
        "reason": reason.strip(),
        "message": (
            "Fee fine adjusted successfully."
        ),
    }