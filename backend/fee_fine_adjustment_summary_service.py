from decimal import Decimal

from sqlalchemy.orm import Session

from models.fee_fine import FeeFine
from models.fee_fine_adjustment import FeeFineAdjustment


def get_fee_fine_adjustment_summary(
    db: Session,
    academic_year: str | None = None,
) -> dict:

    query = (
        db.query(FeeFineAdjustment, FeeFine)
        .join(
            FeeFine,
            FeeFineAdjustment.fee_fine_id == FeeFine.id,
        )
    )

    if academic_year:
        from models.fee_account import FeeAccount

        query = query.join(
            FeeAccount,
            FeeFine.fee_account_id == FeeAccount.id,
        ).filter(
            FeeAccount.academic_year == academic_year
        )

    rows = query.all()

    total_adjustments = len(rows)

    total_adjusted_amount = Decimal("0.00")

    fine_ids = set()
    adjustments_by_type = {}

    for adjustment, fine in rows:
        amount = Decimal(adjustment.adjusted_amount or 0)

        total_adjusted_amount += amount
        fine_ids.add(fine.id)

        adjustment_type = adjustment.adjustment_type

        adjustments_by_type[adjustment_type] = (
            adjustments_by_type.get(
                adjustment_type,
                Decimal("0.00"),
            )
            + amount
        )

    fully_waived_fines = 0
    partially_adjusted_fines = 0

    for fine_id in fine_ids:
        fine = (
            db.query(FeeFine)
            .filter(FeeFine.id == fine_id)
            .first()
        )

        if not fine:
            continue

        if fine.status == "WAIVED":
            fully_waived_fines += 1
        else:
            partially_adjusted_fines += 1

    return {
        "total_adjustments": total_adjustments,
        "total_adjusted_amount": total_adjusted_amount,
        "total_fines_adjusted": len(fine_ids),
        "fully_waived_fines": fully_waived_fines,
        "partially_adjusted_fines": partially_adjusted_fines,
        "adjustments_by_type": adjustments_by_type,
    }