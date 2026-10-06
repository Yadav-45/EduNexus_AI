from decimal import Decimal
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models.fee_account import FeeAccount
from models.fee_fine import FeeFine
from models.fee_fine_adjustment import FeeFineAdjustment


def get_fee_fine_analytics(
    db: Session,
    academic_year: str | None = None,
) -> dict:

    # -----------------------------
    # FINE ANALYTICS
    # -----------------------------

    fine_query = db.query(FeeFine)

    if academic_year:
        fine_query = (
            fine_query
            .join(
                FeeAccount,
                FeeFine.fee_account_id == FeeAccount.id,
            )
            .filter(
                FeeAccount.academic_year == academic_year
            )
        )

    fines = fine_query.all()

    fines_by_type = {}
    fines_by_status = {}

    for fine in fines:
        amount = Decimal(fine.amount or 0)

        fine_type = fine.fine_type
        fine_status = fine.status

        fines_by_type[fine_type] = (
            fines_by_type.get(
                fine_type,
                Decimal("0.00"),
            )
            + amount
        )

        fines_by_status[fine_status] = (
            fines_by_status.get(
                fine_status,
                Decimal("0.00"),
            )
            + amount
        )

    # -----------------------------
    # ADJUSTMENT ANALYTICS
    # -----------------------------

    adjustment_query = db.query(FeeFineAdjustment)

    if academic_year:
        adjustment_query = (
            adjustment_query
            .join(
                FeeFine,
                FeeFineAdjustment.fee_fine_id == FeeFine.id,
            )
            .join(
                FeeAccount,
                FeeFine.fee_account_id == FeeAccount.id,
            )
            .filter(
                FeeAccount.academic_year == academic_year
            )
        )

    adjustments = adjustment_query.all()

    adjustments_by_type = {}

    for adjustment in adjustments:
        amount = Decimal(
            adjustment.adjusted_amount or 0
        )

        adjustment_type = adjustment.adjustment_type

        adjustments_by_type[adjustment_type] = (
            adjustments_by_type.get(
                adjustment_type,
                Decimal("0.00"),
            )
            + amount
        )

    # -----------------------------
    # AGING ANALYTICS
    # -----------------------------

    account_query = db.query(FeeAccount)

    if academic_year:
        account_query = account_query.filter(
            FeeAccount.academic_year == academic_year
        )

    accounts = account_query.all()

    aging_distribution = {
        "CURRENT": 0,
        "0-30": 0,
        "31-60": 0,
        "61-90": 0,
        "90+": 0,
        "PAID": 0,
        "NO_DUE_DATE": 0,
    }

    total_outstanding = Decimal("0.00")

    now = datetime.now(timezone.utc)

    for account in accounts:

        balance = Decimal(account.balance or 0)

        if balance <= 0:
            aging_distribution["PAID"] += 1
            continue

        total_outstanding += balance

        if not account.due_date:
            aging_distribution["NO_DUE_DATE"] += 1
            continue

        due_date = account.due_date

        if due_date.tzinfo is None:
            due_date = due_date.replace(
                tzinfo=timezone.utc
            )

        if due_date >= now:
            aging_distribution["CURRENT"] += 1
            continue

        days_overdue = (
            now.date() - due_date.date()
        ).days

        if days_overdue <= 30:
            aging_distribution["0-30"] += 1
        elif days_overdue <= 60:
            aging_distribution["31-60"] += 1
        elif days_overdue <= 90:
            aging_distribution["61-90"] += 1
        else:
            aging_distribution["90+"] += 1

    total_fines = sum(
        (
            Decimal(fine.amount or 0)
            for fine in fines
        ),
        Decimal("0.00"),
    )

    outstanding_vs_fines = {
        "outstanding": total_outstanding,
        "fines": total_fines,
    }

    return {
        "fines_by_type": fines_by_type,
        "fines_by_status": fines_by_status,
        "adjustments_by_type": adjustments_by_type,
        "aging_distribution": aging_distribution,
        "outstanding_vs_fines": outstanding_vs_fines,
    }