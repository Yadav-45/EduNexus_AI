from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.accounting_income import AccountingIncome
from models.accounting_expense import AccountingExpense

from auth.dependencies import require_roles


router = APIRouter(
    prefix="/accounting-dashboard",
    tags=["Accounting Dashboard"],
)


# ============================================================
# OVERALL SUMMARY
# ============================================================

@router.get("/summary")
def get_accounting_summary(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    income_query = db.query(
        func.coalesce(
            func.sum(AccountingIncome.amount),
            0,
        )
    ).filter(
        AccountingIncome.status == "COMPLETED"
    )

    expense_query = db.query(
        func.coalesce(
            func.sum(AccountingExpense.amount),
            0,
        )
    ).filter(
        AccountingExpense.status == "COMPLETED"
    )

    income_count_query = db.query(
        func.count(AccountingIncome.id)
    ).filter(
        AccountingIncome.status == "COMPLETED"
    )

    expense_count_query = db.query(
        func.count(AccountingExpense.id)
    ).filter(
        AccountingExpense.status == "COMPLETED"
    )

    if start_date:
        income_query = income_query.filter(
            AccountingIncome.transaction_date
            >= start_date
        )

        expense_query = expense_query.filter(
            AccountingExpense.transaction_date
            >= start_date
        )

        income_count_query = income_count_query.filter(
            AccountingIncome.transaction_date
            >= start_date
        )

        expense_count_query = expense_count_query.filter(
            AccountingExpense.transaction_date
            >= start_date
        )

    if end_date:
        income_query = income_query.filter(
            AccountingIncome.transaction_date
            <= end_date
        )

        expense_query = expense_query.filter(
            AccountingExpense.transaction_date
            <= end_date
        )

        income_count_query = income_count_query.filter(
            AccountingIncome.transaction_date
            <= end_date
        )

        expense_count_query = expense_count_query.filter(
            AccountingExpense.transaction_date
            <= end_date
        )

    total_income = Decimal(
        income_query.scalar() or 0
    )

    total_expense = Decimal(
        expense_query.scalar() or 0
    )

    income_count = (
        income_count_query.scalar() or 0
    )

    expense_count = (
        expense_count_query.scalar() or 0
    )

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "net_balance": (
            total_income - total_expense
        ),
        "income_transaction_count": income_count,
        "expense_transaction_count": expense_count,
    }


# ============================================================
# MONTHLY SUMMARY
# ============================================================

@router.get("/monthly")
def get_monthly_accounting_summary(
    year: int = Query(
        default=date.today().year,
        ge=2000,
        le=2100,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    income_rows = (
        db.query(
            extract(
                "month",
                AccountingIncome.transaction_date,
            ).label("month"),
            func.coalesce(
                func.sum(AccountingIncome.amount),
                0,
            ).label("total"),
        )
        .filter(
            AccountingIncome.status == "COMPLETED",
            extract(
                "year",
                AccountingIncome.transaction_date,
            )
            == year,
        )
        .group_by(
            extract(
                "month",
                AccountingIncome.transaction_date,
            )
        )
        .all()
    )

    expense_rows = (
        db.query(
            extract(
                "month",
                AccountingExpense.transaction_date,
            ).label("month"),
            func.coalesce(
                func.sum(AccountingExpense.amount),
                0,
            ).label("total"),
        )
        .filter(
            AccountingExpense.status == "COMPLETED",
            extract(
                "year",
                AccountingExpense.transaction_date,
            )
            == year,
        )
        .group_by(
            extract(
                "month",
                AccountingExpense.transaction_date,
            )
        )
        .all()
    )

    income_by_month = {
        int(row.month): Decimal(row.total or 0)
        for row in income_rows
    }

    expense_by_month = {
        int(row.month): Decimal(row.total or 0)
        for row in expense_rows
    }

    months = []

    for month in range(1, 13):
        income = income_by_month.get(
            month,
            Decimal("0"),
        )

        expense = expense_by_month.get(
            month,
            Decimal("0"),
        )

        months.append(
            {
                "month": month,
                "income": income,
                "expense": expense,
                "net": income - expense,
            }
        )

    return {
        "year": year,
        "months": months,
    }


# ============================================================
# INCOME BY CATEGORY
# ============================================================

@router.get("/income-by-category")
def get_income_by_category(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    query = (
        db.query(
            AccountingIncome.income_category.label(
                "category"
            ),
            func.coalesce(
                func.sum(AccountingIncome.amount),
                0,
            ).label("total"),
        )
        .filter(
            AccountingIncome.status == "COMPLETED"
        )
    )

    if start_date:
        query = query.filter(
            AccountingIncome.transaction_date
            >= start_date
        )

    if end_date:
        query = query.filter(
            AccountingIncome.transaction_date
            <= end_date
        )

    rows = (
        query.group_by(
            AccountingIncome.income_category
        )
        .order_by(
            func.sum(
                AccountingIncome.amount
            ).desc()
        )
        .all()
    )

    return [
        {
            "category": row.category,
            "total": Decimal(
                row.total or 0
            ),
        }
        for row in rows
    ]


# ============================================================
# EXPENSE BY CATEGORY
# ============================================================

@router.get("/expense-by-category")
def get_expense_by_category(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    query = (
        db.query(
            AccountingExpense.expense_category.label(
                "category"
            ),
            func.coalesce(
                func.sum(AccountingExpense.amount),
                0,
            ).label("total"),
        )
        .filter(
            AccountingExpense.status == "COMPLETED"
        )
    )

    if start_date:
        query = query.filter(
            AccountingExpense.transaction_date
            >= start_date
        )

    if end_date:
        query = query.filter(
            AccountingExpense.transaction_date
            <= end_date
        )

    rows = (
        query.group_by(
            AccountingExpense.expense_category
        )
        .order_by(
            func.sum(
                AccountingExpense.amount
            ).desc()
        )
        .all()
    )

    return [
        {
            "category": row.category,
            "total": Decimal(
                row.total or 0
            ),
        }
        for row in rows
    ]