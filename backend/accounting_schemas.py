from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# CONSTANTS
# ============================================================

INCOME_CATEGORIES = {
    "FEE_COLLECTION",
    "ADMISSION_FEE",
    "TRANSPORT_FEE",
    "HOSTEL_FEE",
    "OTHER_INCOME",
}

EXPENSE_CATEGORIES = {
    "SALARY",
    "ELECTRICITY",
    "WATER",
    "RENT",
    "MAINTENANCE",
    "TRANSPORT",
    "SUPPLIES",
    "MARKETING",
    "OTHER_EXPENSE",
}

ACCOUNTING_STATUSES = {
    "COMPLETED",
    "PENDING",
    "CANCELLED",
}

PAYMENT_METHODS = {
    "CASH",
    "BANK_TRANSFER",
    "CARD",
    "ONLINE",
    "CHEQUE",
    "OTHER",
}


# ============================================================
# INCOME
# ============================================================

class AccountingIncomeCreate(BaseModel):
    transaction_date: date = Field(default_factory=date.today)

    income_category: str

    description: str = Field(
        min_length=2,
        max_length=255,
    )

    amount: Decimal = Field(gt=0)

    payment_method: str | None = None

    reference_number: str | None = Field(
        default=None,
        max_length=100,
    )

    student_id: int | None = None

    fee_payment_id: int | None = None

    status: str = "COMPLETED"

    notes: str | None = None


class AccountingIncomeUpdate(BaseModel):
    transaction_date: date | None = None

    income_category: str | None = None

    description: str | None = Field(
        default=None,
        min_length=2,
        max_length=255,
    )

    amount: Decimal | None = Field(
        default=None,
        gt=0,
    )

    payment_method: str | None = None

    reference_number: str | None = Field(
        default=None,
        max_length=100,
    )

    student_id: int | None = None

    fee_payment_id: int | None = None

    status: str | None = None

    notes: str | None = None


class AccountingIncomeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    transaction_number: str
    transaction_date: date
    income_category: str
    description: str
    amount: Decimal
    payment_method: str | None
    reference_number: str | None
    student_id: int | None
    fee_payment_id: int | None
    status: str
    notes: str | None
    created_by: int | None
    created_at: datetime
    updated_at: datetime


# ============================================================
# EXPENSE
# ============================================================

class AccountingExpenseCreate(BaseModel):
    transaction_date: date = Field(default_factory=date.today)

    expense_category: str

    description: str = Field(
        min_length=2,
        max_length=255,
    )

    amount: Decimal = Field(gt=0)

    payment_method: str | None = None

    reference_number: str | None = Field(
        default=None,
        max_length=100,
    )

    vendor_name: str | None = Field(
        default=None,
        max_length=200,
    )

    status: str = "COMPLETED"

    notes: str | None = None


class AccountingExpenseUpdate(BaseModel):
    transaction_date: date | None = None

    expense_category: str | None = None

    description: str | None = Field(
        default=None,
        min_length=2,
        max_length=255,
    )

    amount: Decimal | None = Field(
        default=None,
        gt=0,
    )

    payment_method: str | None = None

    reference_number: str | None = Field(
        default=None,
        max_length=100,
    )

    vendor_name: str | None = Field(
        default=None,
        max_length=200,
    )

    status: str | None = None

    notes: str | None = None


class AccountingExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    transaction_number: str
    transaction_date: date
    expense_category: str
    description: str
    amount: Decimal
    payment_method: str | None
    reference_number: str | None
    vendor_name: str | None
    status: str
    notes: str | None
    created_by: int | None

    # ========================================================
    # INVENTORY LINK
    # ========================================================

    inventory_movement_id: int | None

    created_at: datetime
    updated_at: datetime


# ============================================================
# DASHBOARD
# ============================================================

class AccountingDashboardResponse(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    net_balance: Decimal

    income_transaction_count: int
    expense_transaction_count: int


# ============================================================
# PAGINATION
# ============================================================

class AccountingIncomeListResponse(BaseModel):
    items: list[AccountingIncomeResponse]

    page: int
    page_size: int
    total: int
    total_pages: int


class AccountingExpenseListResponse(BaseModel):
    items: list[AccountingExpenseResponse]

    page: int
    page_size: int
    total: int
    total_pages: int