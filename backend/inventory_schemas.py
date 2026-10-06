from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# STATUS CONSTANTS
# ============================================================

CATEGORY_STATUSES = {
    "ACTIVE",
    "INACTIVE",
}

SUPPLIER_STATUSES = {
    "ACTIVE",
    "INACTIVE",
}

ITEM_STATUSES = {
    "ACTIVE",
    "INACTIVE",
    "DISCONTINUED",
}

MOVEMENT_TYPES = {
    "STOCK_IN",
    "STOCK_OUT",
    "ISSUE",
    "RETURN",
    "ADJUSTMENT_IN",
    "ADJUSTMENT_OUT",
    "TRANSFER_IN",
    "TRANSFER_OUT",
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


# ============================================================
# CATEGORY
# ============================================================

class InventoryCategoryCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    code: str = Field(
        min_length=2,
        max_length=30,
    )

    description: str | None = None

    status: str = "ACTIVE"


class InventoryCategoryUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    code: str | None = Field(
        default=None,
        min_length=2,
        max_length=30,
    )

    description: str | None = None

    status: str | None = None


class InventoryCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: str
    description: str | None
    status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class InventoryCategoryListResponse(BaseModel):
    items: list[InventoryCategoryResponse]

    page: int
    page_size: int
    total: int
    total_pages: int


# ============================================================
# SUPPLIER
# ============================================================

class InventorySupplierCreate(BaseModel):
    supplier_name: str = Field(
        min_length=2,
        max_length=200,
    )

    contact_person: str | None = Field(
        default=None,
        max_length=200,
    )

    phone: str | None = Field(
        default=None,
        max_length=30,
    )

    alternate_phone: str | None = Field(
        default=None,
        max_length=30,
    )

    email: str | None = Field(
        default=None,
        max_length=150,
    )

    address: str | None = None

    pan_number: str | None = Field(
        default=None,
        max_length=50,
    )

    status: str = "ACTIVE"

    notes: str | None = None


class InventorySupplierUpdate(BaseModel):
    supplier_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    contact_person: str | None = Field(
        default=None,
        max_length=200,
    )

    phone: str | None = Field(
        default=None,
        max_length=30,
    )

    alternate_phone: str | None = Field(
        default=None,
        max_length=30,
    )

    email: str | None = Field(
        default=None,
        max_length=150,
    )

    address: str | None = None

    pan_number: str | None = Field(
        default=None,
        max_length=50,
    )

    status: str | None = None

    notes: str | None = None


class InventorySupplierResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    supplier_code: str
    supplier_name: str
    contact_person: str | None
    phone: str | None
    alternate_phone: str | None
    email: str | None
    address: str | None
    pan_number: str | None
    status: str
    is_active: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime


class InventorySupplierListResponse(BaseModel):
    items: list[InventorySupplierResponse]

    page: int
    page_size: int
    total: int
    total_pages: int


# ============================================================
# ITEM
# ============================================================

class InventoryItemCreate(BaseModel):
    item_name: str = Field(
        min_length=2,
        max_length=200,
    )

    category_id: int

    subcategory: str | None = Field(
        default=None,
        max_length=100,
    )

    description: str | None = None

    unit: str = Field(
        min_length=1,
        max_length=30,
    )

    current_quantity: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    minimum_stock_level: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    maximum_stock_level: Decimal | None = Field(
        default=None,
        ge=0,
    )

    unit_cost: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    supplier_id: int | None = None

    storage_location: str | None = Field(
        default=None,
        max_length=200,
    )

    status: str = "ACTIVE"

    notes: str | None = None


class InventoryItemUpdate(BaseModel):
    item_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    category_id: int | None = None

    subcategory: str | None = Field(
        default=None,
        max_length=100,
    )

    description: str | None = None

    unit: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
    )

    minimum_stock_level: Decimal | None = Field(
        default=None,
        ge=0,
    )

    maximum_stock_level: Decimal | None = Field(
        default=None,
        ge=0,
    )

    unit_cost: Decimal | None = Field(
        default=None,
        ge=0,
    )

    supplier_id: int | None = None

    storage_location: str | None = Field(
        default=None,
        max_length=200,
    )

    status: str | None = None

    notes: str | None = None


class InventoryItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_code: str
    item_name: str
    category_id: int
    subcategory: str | None
    description: str | None
    unit: str
    current_quantity: Decimal
    minimum_stock_level: Decimal
    maximum_stock_level: Decimal | None
    unit_cost: Decimal
    supplier_id: int | None
    storage_location: str | None
    status: str
    is_active: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime


class InventoryItemListResponse(BaseModel):
    items: list[InventoryItemResponse]

    page: int
    page_size: int
    total: int
    total_pages: int


# ============================================================
# STOCK MOVEMENT
# ============================================================

class InventoryMovementCreate(BaseModel):
    item_id: int

    movement_type: str

    quantity: Decimal = Field(
        gt=0,
    )

    unit_cost: Decimal | None = Field(
        default=None,
        ge=0,
    )

    reference_number: str | None = Field(
        default=None,
        max_length=100,
    )

    supplier_id: int | None = None

    remarks: str | None = None

    # ========================================================
    # ACCOUNTING INTEGRATION
    # ========================================================

    create_accounting_expense: bool = False

    expense_category: str = "SUPPLIES"


class InventoryMovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    movement_number: str
    item_id: int
    movement_type: str
    quantity: Decimal
    unit_cost: Decimal | None
    total_value: Decimal | None
    reference_number: str | None
    supplier_id: int | None
    performed_by: int | None
    remarks: str | None
    created_at: datetime


class InventoryMovementListResponse(BaseModel):
    items: list[InventoryMovementResponse]

    page: int
    page_size: int
    total: int
    total_pages: int


# ============================================================
# INVENTORY ACCOUNTING RECONCILIATION
# ============================================================

class InventoryAccountingReconciliationResponse(BaseModel):
    movement_id: int
    movement_number: str

    item_id: int
    item_name: str

    movement_type: str

    quantity: Decimal
    unit_cost: Decimal | None
    inventory_total_value: Decimal | None

    accounting_expense_id: int | None
    accounting_transaction_number: str | None
    accounting_amount: Decimal | None
    accounting_status: str | None

    reconciliation_status: str


# ============================================================
# DASHBOARD
# ============================================================

class InventoryDashboardResponse(BaseModel):
    total_items: int
    active_items: int
    inactive_items: int

    total_categories: int
    total_suppliers: int

    low_stock_items: int
    out_of_stock_items: int

    total_inventory_value: Decimal

    total_stock_in_value: Decimal
    total_stock_out_value: Decimal

    recent_movements: list[InventoryMovementResponse]