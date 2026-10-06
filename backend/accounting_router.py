from datetime import date
from decimal import Decimal
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.student import Student
from models.accounting_income import AccountingIncome
from models.accounting_expense import AccountingExpense

from auth.dependencies import require_roles

from accounting_schemas import (
    AccountingDashboardResponse,
    AccountingExpenseCreate,
    AccountingExpenseListResponse,
    AccountingExpenseResponse,
    AccountingExpenseUpdate,
    AccountingIncomeCreate,
    AccountingIncomeListResponse,
    AccountingIncomeResponse,
    AccountingIncomeUpdate,
    ACCOUNTING_STATUSES,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    PAYMENT_METHODS,
)


router = APIRouter(
    prefix="/accounting",
    tags=["Accounting"],
)


# ============================================================
# HELPERS
# ============================================================

def generate_income_transaction_number(db: Session) -> str:
    today = date.today()

    prefix = f"INC-{today.year}-"

    last_transaction = (
        db.query(AccountingIncome)
        .filter(
            AccountingIncome.transaction_number.like(
                f"{prefix}%"
            )
        )
        .order_by(AccountingIncome.id.desc())
        .first()
    )

    if last_transaction:
        try:
            last_number = int(
                last_transaction.transaction_number.split("-")[-1]
            )
        except (ValueError, IndexError):
            last_number = 0
    else:
        last_number = 0

    return f"{prefix}{last_number + 1:06d}"


def generate_expense_transaction_number(db: Session) -> str:
    today = date.today()

    prefix = f"EXP-{today.year}-"

    last_transaction = (
        db.query(AccountingExpense)
        .filter(
            AccountingExpense.transaction_number.like(
                f"{prefix}%"
            )
        )
        .order_by(AccountingExpense.id.desc())
        .first()
    )

    if last_transaction:
        try:
            last_number = int(
                last_transaction.transaction_number.split("-")[-1]
            )
        except (ValueError, IndexError):
            last_number = 0
    else:
        last_number = 0

    return f"{prefix}{last_number + 1:06d}"


def validate_income_values(data: AccountingIncomeCreate):
    if data.income_category not in INCOME_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid income category",
        )

    if (
        data.payment_method
        and data.payment_method not in PAYMENT_METHODS
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment method",
        )


def validate_expense_values(data: AccountingExpenseCreate):
    if data.expense_category not in EXPENSE_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid expense category",
        )

    if (
        data.payment_method
        and data.payment_method not in PAYMENT_METHODS
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment method",
        )


# ============================================================
# ACCOUNTING DASHBOARD
# ============================================================

@router.get(
    "/dashboard",
    response_model=AccountingDashboardResponse,
)
def get_accounting_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    total_income = (
        db.query(
            func.coalesce(
                func.sum(AccountingIncome.amount),
                0,
            )
        )
        .filter(
            AccountingIncome.status == "COMPLETED"
        )
        .scalar()
    )

    total_expense = (
        db.query(
            func.coalesce(
                func.sum(AccountingExpense.amount),
                0,
            )
        )
        .filter(
            AccountingExpense.status == "COMPLETED"
        )
        .scalar()
    )

    income_count = (
        db.query(
            func.count(AccountingIncome.id)
        )
        .filter(
            AccountingIncome.status == "COMPLETED"
        )
        .scalar()
    )

    expense_count = (
        db.query(
            func.count(AccountingExpense.id)
        )
        .filter(
            AccountingExpense.status == "COMPLETED"
        )
        .scalar()
    )

    total_income = Decimal(total_income or 0)
    total_expense = Decimal(total_expense or 0)

    return AccountingDashboardResponse(
        total_income=total_income,
        total_expense=total_expense,
        net_balance=total_income - total_expense,
        income_transaction_count=income_count or 0,
        expense_transaction_count=expense_count or 0,
    )


# ============================================================
# INCOME - CREATE
# ============================================================

@router.post(
    "/income",
    response_model=AccountingIncomeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_income(
    data: AccountingIncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    validate_income_values(data)

    if data.student_id:
        student = (
            db.query(Student)
            .filter(Student.id == data.student_id)
            .first()
        )

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found",
            )

    transaction_number = (
        generate_income_transaction_number(db)
    )

    income = AccountingIncome(
        transaction_number=transaction_number,
        transaction_date=data.transaction_date,
        income_category=data.income_category,
        description=data.description,
        amount=data.amount,
        payment_method=data.payment_method,
        reference_number=data.reference_number,
        student_id=data.student_id,
        fee_payment_id=data.fee_payment_id,
        status="COMPLETED",
        notes=data.notes,
        created_by=current_user.id,
    )

    db.add(income)
    db.commit()
    db.refresh(income)

    return income


# ============================================================
# INCOME - LIST
# ============================================================

@router.get(
    "/income",
    response_model=AccountingIncomeListResponse,
)
def list_income(
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=25,
        ge=1,
        le=100,
    ),
    search: str | None = Query(
        default=None,
    ),
    category: str | None = Query(
        default=None,
    ),
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    payment_method: str | None = Query(
        default=None,
    ),
    start_date: date | None = Query(
        default=None,
    ),
    end_date: date | None = Query(
        default=None,
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
    query = db.query(AccountingIncome)

    if search:
        search_value = f"%{search.strip()}%"

        query = query.outerjoin(
            Student,
            AccountingIncome.student_id == Student.id,
        ).filter(
            or_(
                AccountingIncome.transaction_number.ilike(
                    search_value
                ),
                AccountingIncome.description.ilike(
                    search_value
                ),
                AccountingIncome.reference_number.ilike(
                    search_value
                ),
                Student.first_name.ilike(
                    search_value
                ),
                Student.last_name.ilike(
                    search_value
                ),
                Student.admission_number.ilike(
                    search_value
                ),
            )
        )

    if category:
        if category not in INCOME_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid income category",
            )

        query = query.filter(
            AccountingIncome.income_category == category
        )

    if status_filter:
        if status_filter not in ACCOUNTING_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid accounting status",
            )

        query = query.filter(
            AccountingIncome.status == status_filter
        )

    if payment_method:
        if payment_method not in PAYMENT_METHODS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment method",
            )

        query = query.filter(
            AccountingIncome.payment_method
            == payment_method
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

    total = query.count()

    total_pages = (
        ceil(total / page_size)
        if total
        else 0
    )

    offset = (page - 1) * page_size

    items = (
        query.order_by(
            AccountingIncome.transaction_date.desc(),
            AccountingIncome.id.desc(),
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return AccountingIncomeListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


# ============================================================
# INCOME - GET ONE
# ============================================================

@router.get(
    "/income/{income_id}",
    response_model=AccountingIncomeResponse,
)
def get_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    income = (
        db.query(AccountingIncome)
        .filter(AccountingIncome.id == income_id)
        .first()
    )

    if not income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income transaction not found",
        )

    return income


# ============================================================
# INCOME - UPDATE
# ============================================================

@router.put(
    "/income/{income_id}",
    response_model=AccountingIncomeResponse,
)
def update_income(
    income_id: int,
    data: AccountingIncomeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    income = (
        db.query(AccountingIncome)
        .filter(AccountingIncome.id == income_id)
        .first()
    )

    if not income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income transaction not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "income_category" in update_data:
        if (
            update_data["income_category"]
            not in INCOME_CATEGORIES
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid income category",
            )

    if "payment_method" in update_data:
        if (
            update_data["payment_method"]
            and update_data["payment_method"]
            not in PAYMENT_METHODS
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment method",
            )

    if "status" in update_data:
        if (
            update_data["status"]
            not in ACCOUNTING_STATUSES
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid accounting status",
            )

    for field, value in update_data.items():
        setattr(income, field, value)

    db.commit()
    db.refresh(income)

    return income


# ============================================================
# EXPENSE - CREATE
# ============================================================

@router.post(
    "/expenses",
    response_model=AccountingExpenseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_expense(
    data: AccountingExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    validate_expense_values(data)

    transaction_number = (
        generate_expense_transaction_number(db)
    )

    expense = AccountingExpense(
        transaction_number=transaction_number,
        transaction_date=data.transaction_date,
        expense_category=data.expense_category,
        description=data.description,
        amount=data.amount,
        payment_method=data.payment_method,
        reference_number=data.reference_number,
        vendor_name=data.vendor_name,
        status="COMPLETED",
        notes=data.notes,
        created_by=current_user.id,
    )

    db.add(expense)
    db.commit()
    db.refresh(expense)

    return expense


# ============================================================
# EXPENSE - LIST
# ============================================================

@router.get(
    "/expenses",
    response_model=AccountingExpenseListResponse,
)
def list_expenses(
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=25,
        ge=1,
        le=100,
    ),
    search: str | None = Query(
        default=None,
    ),
    category: str | None = Query(
        default=None,
    ),
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    payment_method: str | None = Query(
        default=None,
    ),
    start_date: date | None = Query(
        default=None,
    ),
    end_date: date | None = Query(
        default=None,
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
    query = db.query(AccountingExpense)

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                AccountingExpense.transaction_number.ilike(
                    search_value
                ),
                AccountingExpense.description.ilike(
                    search_value
                ),
                AccountingExpense.reference_number.ilike(
                    search_value
                ),
                AccountingExpense.vendor_name.ilike(
                    search_value
                ),
            )
        )

    if category:
        if category not in EXPENSE_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid expense category",
            )

        query = query.filter(
            AccountingExpense.expense_category
            == category
        )

    if status_filter:
        if status_filter not in ACCOUNTING_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid accounting status",
            )

        query = query.filter(
            AccountingExpense.status == status_filter
        )

    if payment_method:
        if payment_method not in PAYMENT_METHODS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment method",
            )

        query = query.filter(
            AccountingExpense.payment_method
            == payment_method
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

    total = query.count()

    total_pages = (
        ceil(total / page_size)
        if total
        else 0
    )

    offset = (page - 1) * page_size

    items = (
        query.order_by(
            AccountingExpense.transaction_date.desc(),
            AccountingExpense.id.desc(),
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return AccountingExpenseListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


# ============================================================
# EXPENSE - GET ONE
# ============================================================

@router.get(
    "/expenses/{expense_id}",
    response_model=AccountingExpenseResponse,
)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    expense = (
        db.query(AccountingExpense)
        .filter(
            AccountingExpense.id == expense_id
        )
        .first()
    )

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense transaction not found",
        )

    return expense


# ============================================================
# EXPENSE - UPDATE
# ============================================================

@router.put(
    "/expenses/{expense_id}",
    response_model=AccountingExpenseResponse,
)
def update_expense(
    expense_id: int,
    data: AccountingExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    expense = (
        db.query(AccountingExpense)
        .filter(
            AccountingExpense.id == expense_id
        )
        .first()
    )

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense transaction not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "expense_category" in update_data:
        if (
            update_data["expense_category"]
            not in EXPENSE_CATEGORIES
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid expense category",
            )

    if "payment_method" in update_data:
        if (
            update_data["payment_method"]
            and update_data["payment_method"]
            not in PAYMENT_METHODS
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment method",
            )

    if "status" in update_data:
        if (
            update_data["status"]
            not in ACCOUNTING_STATUSES
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid accounting status",
            )

    for field, value in update_data.items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)

    return expense