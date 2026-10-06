from datetime import date
from decimal import Decimal
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database import get_db
from auth.dependencies import require_roles

from models.inventory_category import InventoryCategory
from models.inventory_supplier import InventorySupplier
from models.inventory_item import InventoryItem
from models.inventory_movement import InventoryMovement
from models.accounting_expense import AccountingExpense

from inventory_schemas import (
    InventoryCategoryCreate,
    InventoryCategoryUpdate,
    InventoryCategoryResponse,
    InventoryCategoryListResponse,

    InventorySupplierCreate,
    InventorySupplierUpdate,
    InventorySupplierResponse,
    InventorySupplierListResponse,

    InventoryItemCreate,
    InventoryItemUpdate,
    InventoryItemResponse,
    InventoryItemListResponse,

    InventoryMovementCreate,
    InventoryMovementResponse,
    InventoryMovementListResponse,

    InventoryAccountingReconciliationResponse,

    InventoryDashboardResponse,

    CATEGORY_STATUSES,
    SUPPLIER_STATUSES,
    ITEM_STATUSES,
    MOVEMENT_TYPES,
    EXPENSE_CATEGORIES,
)


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory Management"],
)


# ============================================================
# HELPERS
# ============================================================

def get_total_pages(
    total: int,
    page_size: int,
) -> int:
    if total == 0:
        return 0

    return ceil(total / page_size)


def generate_category_code(
    db: Session,
) -> str:
    count = (
        db.query(InventoryCategory)
        .count()
    )

    return f"CAT-{count + 1:05d}"


def generate_supplier_code(
    db: Session,
) -> str:
    count = (
        db.query(InventorySupplier)
        .count()
    )

    return f"SUP-{count + 1:05d}"


def generate_item_code(
    db: Session,
) -> str:
    count = (
        db.query(InventoryItem)
        .count()
    )

    return f"ITEM-{count + 1:06d}"


def generate_movement_number(
    db: Session,
) -> str:
    year = date.today().year

    prefix = f"MOV-{year}-"

    last_movement = (
        db.query(InventoryMovement)
        .filter(
            InventoryMovement.movement_number.like(
                f"{prefix}%"
            )
        )
        .order_by(
            InventoryMovement.id.desc()
        )
        .first()
    )

    if last_movement:
        try:
            last_number = int(
                last_movement.movement_number.split("-")[-1]
            )
        except (
            ValueError,
            IndexError,
        ):
            last_number = 0
    else:
        last_number = 0

    return (
        f"{prefix}"
        f"{last_number + 1:06d}"
    )


def generate_expense_transaction_number(
    db: Session,
) -> str:
    year = date.today().year

    prefix = f"EXP-{year}-"

    last_expense = (
        db.query(AccountingExpense)
        .filter(
            AccountingExpense.transaction_number.like(
                f"{prefix}%"
            )
        )
        .order_by(
            AccountingExpense.id.desc()
        )
        .first()
    )

    if last_expense:
        try:
            last_number = int(
                last_expense.transaction_number.split("-")[-1]
            )
        except (
            ValueError,
            IndexError,
        ):
            last_number = 0
    else:
        last_number = 0

    return (
        f"{prefix}"
        f"{last_number + 1:06d}"
    )


def validate_category_status(
    status: str,
):
    status = status.upper()

    if status not in CATEGORY_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid category status. "
                f"Allowed values: "
                f"{', '.join(sorted(CATEGORY_STATUSES))}"
            ),
        )

    return status


def validate_supplier_status(
    status: str,
):
    status = status.upper()

    if status not in SUPPLIER_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid supplier status. "
                f"Allowed values: "
                f"{', '.join(sorted(SUPPLIER_STATUSES))}"
            ),
        )

    return status


def validate_item_status(
    status: str,
):
    status = status.upper()

    if status not in ITEM_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid item status. "
                f"Allowed values: "
                f"{', '.join(sorted(ITEM_STATUSES))}"
            ),
        )

    return status


def validate_movement_type(
    movement_type: str,
):
    movement_type = movement_type.upper()

    if movement_type not in MOVEMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid movement type. "
                f"Allowed values: "
                f"{', '.join(sorted(MOVEMENT_TYPES))}"
            ),
        )

    return movement_type


def validate_expense_category(
    category: str,
):
    category = category.upper()

    if category not in EXPENSE_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid expense category. "
                f"Allowed values: "
                f"{', '.join(sorted(EXPENSE_CATEGORIES))}"
            ),
        )

    return category


# ============================================================
# DASHBOARD
# ============================================================

@router.get(
    "/dashboard",
    response_model=InventoryDashboardResponse,
)
def get_inventory_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    total_items = (
        db.query(InventoryItem)
        .count()
    )

    active_items = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.is_active == True
        )
        .count()
    )

    inactive_items = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.is_active == False
        )
        .count()
    )

    total_categories = (
        db.query(InventoryCategory)
        .filter(
            InventoryCategory.is_active == True
        )
        .count()
    )

    total_suppliers = (
        db.query(InventorySupplier)
        .filter(
            InventorySupplier.is_active == True
        )
        .count()
    )

    low_stock_items = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.is_active == True,
            InventoryItem.current_quantity
            <= InventoryItem.minimum_stock_level,
        )
        .count()
    )

    out_of_stock_items = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.is_active == True,
            InventoryItem.current_quantity <= 0,
        )
        .count()
    )

    inventory_value = (
        db.query(
            func.coalesce(
                func.sum(
                    InventoryItem.current_quantity
                    * InventoryItem.unit_cost
                ),
                0,
            )
        )
        .filter(
            InventoryItem.is_active == True
        )
        .scalar()
    )

    stock_in_value = (
        db.query(
            func.coalesce(
                func.sum(
                    InventoryMovement.total_value
                ),
                0,
            )
        )
        .filter(
            InventoryMovement.movement_type.in_(
                [
                    "STOCK_IN",
                    "RETURN",
                    "ADJUSTMENT_IN",
                    "TRANSFER_IN",
                ]
            )
        )
        .scalar()
    )

    stock_out_value = (
        db.query(
            func.coalesce(
                func.sum(
                    InventoryMovement.total_value
                ),
                0,
            )
        )
        .filter(
            InventoryMovement.movement_type.in_(
                [
                    "STOCK_OUT",
                    "ISSUE",
                    "ADJUSTMENT_OUT",
                    "TRANSFER_OUT",
                ]
            )
        )
        .scalar()
    )

    recent_movements = (
        db.query(InventoryMovement)
        .order_by(
            InventoryMovement.id.desc()
        )
        .limit(10)
        .all()
    )

    return InventoryDashboardResponse(
        total_items=total_items,
        active_items=active_items,
        inactive_items=inactive_items,
        total_categories=total_categories,
        total_suppliers=total_suppliers,
        low_stock_items=low_stock_items,
        out_of_stock_items=out_of_stock_items,
        total_inventory_value=Decimal(
            str(inventory_value or 0)
        ),
        total_stock_in_value=Decimal(
            str(stock_in_value or 0)
        ),
        total_stock_out_value=Decimal(
            str(stock_out_value or 0)
        ),
        recent_movements=recent_movements,
    )


# ============================================================
# CATEGORIES
# ============================================================

@router.post(
    "/categories",
    response_model=InventoryCategoryResponse,
)
def create_category(
    data: InventoryCategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    existing = (
        db.query(InventoryCategory)
        .filter(
            or_(
                InventoryCategory.name
                == data.name,
                InventoryCategory.code
                == data.code,
            )
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail=(
                "Category name or code "
                "already exists."
            ),
        )

    status = validate_category_status(
        data.status
    )

    category = InventoryCategory(
        name=data.name,
        code=data.code.upper(),
        description=data.description,
        status=status,
        is_active=status == "ACTIVE",
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


@router.get(
    "/categories",
    response_model=InventoryCategoryListResponse,
)
def list_categories(
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    search: str | None = None,
    status: str | None = None,
    include_archived: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    query = db.query(
        InventoryCategory
    )

    if not include_archived:
        query = query.filter(
            InventoryCategory.is_active == True
        )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                InventoryCategory.name.ilike(
                    search_value
                ),
                InventoryCategory.code.ilike(
                    search_value
                ),
                InventoryCategory.description.ilike(
                    search_value
                ),
            )
        )

    if status:
        status = validate_category_status(
            status
        )

        query = query.filter(
            InventoryCategory.status == status
        )

    total = query.count()

    categories = (
        query.order_by(
            InventoryCategory.id.desc()
        )
        .offset(
            (page - 1) * page_size
        )
        .limit(page_size)
        .all()
    )

    return InventoryCategoryListResponse(
        items=categories,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=get_total_pages(
            total,
            page_size,
        ),
    )


@router.get(
    "/categories/{category_id}",
    response_model=InventoryCategoryResponse,
)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    category = (
        db.query(InventoryCategory)
        .filter(
            InventoryCategory.id
            == category_id
        )
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found.",
        )

    return category


@router.put(
    "/categories/{category_id}",
    response_model=InventoryCategoryResponse,
)
def update_category(
    category_id: int,
    data: InventoryCategoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    category = (
        db.query(InventoryCategory)
        .filter(
            InventoryCategory.id
            == category_id
        )
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found.",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "status" in update_data:
        update_data["status"] = (
            validate_category_status(
                update_data["status"]
            )
        )

        update_data["is_active"] = (
            update_data["status"]
            == "ACTIVE"
        )

    if "code" in update_data:
        update_data["code"] = (
            update_data["code"].upper()
        )

    for key, value in update_data.items():
        setattr(
            category,
            key,
            value,
        )

    db.commit()
    db.refresh(category)

    return category


@router.delete(
    "/categories/{category_id}",
)
def archive_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    category = (
        db.query(InventoryCategory)
        .filter(
            InventoryCategory.id
            == category_id
        )
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found.",
        )

    category.is_active = False
    category.status = "INACTIVE"

    db.commit()

    return {
        "message": "Category archived successfully."
    }


@router.patch(
    "/categories/{category_id}/restore",
)
def restore_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    category = (
        db.query(InventoryCategory)
        .filter(
            InventoryCategory.id
            == category_id
        )
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found.",
        )

    category.is_active = True
    category.status = "ACTIVE"

    db.commit()

    return {
        "message": "Category restored successfully."
    }


# ============================================================
# SUPPLIERS
# ============================================================

@router.post(
    "/suppliers",
    response_model=InventorySupplierResponse,
)
def create_supplier(
    data: InventorySupplierCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    status = validate_supplier_status(
        data.status
    )

    supplier_code = generate_supplier_code(
        db
    )

    supplier = InventorySupplier(
        supplier_code=supplier_code,
        supplier_name=data.supplier_name,
        contact_person=data.contact_person,
        phone=data.phone,
        alternate_phone=data.alternate_phone,
        email=data.email,
        address=data.address,
        pan_number=data.pan_number,
        status=status,
        is_active=status == "ACTIVE",
        notes=data.notes,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


@router.get(
    "/suppliers",
    response_model=InventorySupplierListResponse,
)
def list_suppliers(
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    search: str | None = None,
    status: str | None = None,
    include_archived: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    query = db.query(
        InventorySupplier
    )

    if not include_archived:
        query = query.filter(
            InventorySupplier.is_active == True
        )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                InventorySupplier.supplier_code.ilike(
                    search_value
                ),
                InventorySupplier.supplier_name.ilike(
                    search_value
                ),
                InventorySupplier.contact_person.ilike(
                    search_value
                ),
                InventorySupplier.phone.ilike(
                    search_value
                ),
                InventorySupplier.email.ilike(
                    search_value
                ),
            )
        )

    if status:
        status = validate_supplier_status(
            status
        )

        query = query.filter(
            InventorySupplier.status
            == status
        )

    total = query.count()

    suppliers = (
        query.order_by(
            InventorySupplier.id.desc()
        )
        .offset(
            (page - 1) * page_size
        )
        .limit(page_size)
        .all()
    )

    return InventorySupplierListResponse(
        items=suppliers,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=get_total_pages(
            total,
            page_size,
        ),
    )


@router.get(
    "/suppliers/{supplier_id}",
    response_model=InventorySupplierResponse,
)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    supplier = (
        db.query(InventorySupplier)
        .filter(
            InventorySupplier.id
            == supplier_id
        )
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found.",
        )

    return supplier


@router.put(
    "/suppliers/{supplier_id}",
    response_model=InventorySupplierResponse,
)
def update_supplier(
    supplier_id: int,
    data: InventorySupplierUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    supplier = (
        db.query(InventorySupplier)
        .filter(
            InventorySupplier.id
            == supplier_id
        )
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found.",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "status" in update_data:
        update_data["status"] = (
            validate_supplier_status(
                update_data["status"]
            )
        )

        update_data["is_active"] = (
            update_data["status"]
            == "ACTIVE"
        )

    for key, value in update_data.items():
        setattr(
            supplier,
            key,
            value,
        )

    db.commit()
    db.refresh(supplier)

    return supplier


@router.delete(
    "/suppliers/{supplier_id}",
)
def archive_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    supplier = (
        db.query(InventorySupplier)
        .filter(
            InventorySupplier.id
            == supplier_id
        )
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found.",
        )

    supplier.is_active = False
    supplier.status = "INACTIVE"

    db.commit()

    return {
        "message": "Supplier archived successfully."
    }


@router.patch(
    "/suppliers/{supplier_id}/restore",
)
def restore_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    supplier = (
        db.query(InventorySupplier)
        .filter(
            InventorySupplier.id
            == supplier_id
        )
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found.",
        )

    supplier.is_active = True
    supplier.status = "ACTIVE"

    db.commit()

    return {
        "message": "Supplier restored successfully."
    }


# ============================================================
# ITEMS
# ============================================================

@router.post(
    "/items",
    response_model=InventoryItemResponse,
)
def create_item(
    data: InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    category = (
        db.query(InventoryCategory)
        .filter(
            InventoryCategory.id
            == data.category_id
        )
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Inventory category not found.",
        )

    if data.supplier_id is not None:
        supplier = (
            db.query(InventorySupplier)
            .filter(
                InventorySupplier.id
                == data.supplier_id
            )
            .first()
        )

        if not supplier:
            raise HTTPException(
                status_code=404,
                detail="Supplier not found.",
            )

    status = validate_item_status(
        data.status
    )

    item_code = generate_item_code(
        db
    )

    item = InventoryItem(
        item_code=item_code,
        item_name=data.item_name,
        category_id=data.category_id,
        subcategory=data.subcategory,
        description=data.description,
        unit=data.unit,
        current_quantity=data.current_quantity,
        minimum_stock_level=data.minimum_stock_level,
        maximum_stock_level=data.maximum_stock_level,
        unit_cost=data.unit_cost,
        supplier_id=data.supplier_id,
        storage_location=data.storage_location,
        status=status,
        is_active=status == "ACTIVE",
        notes=data.notes,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


@router.get(
    "/items",
    response_model=InventoryItemListResponse,
)
def list_items(
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    search: str | None = None,
    category_id: int | None = None,
    supplier_id: int | None = None,
    status: str | None = None,
    low_stock_only: bool = False,
    include_archived: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    query = db.query(
        InventoryItem
    )

    if not include_archived:
        query = query.filter(
            InventoryItem.is_active == True
        )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                InventoryItem.item_code.ilike(
                    search_value
                ),
                InventoryItem.item_name.ilike(
                    search_value
                ),
                InventoryItem.description.ilike(
                    search_value
                ),
                InventoryItem.storage_location.ilike(
                    search_value
                ),
            )
        )

    if category_id is not None:
        query = query.filter(
            InventoryItem.category_id
            == category_id
        )

    if supplier_id is not None:
        query = query.filter(
            InventoryItem.supplier_id
            == supplier_id
        )

    if status:
        status = validate_item_status(
            status
        )

        query = query.filter(
            InventoryItem.status == status
        )

    if low_stock_only:
        query = query.filter(
            InventoryItem.current_quantity
            <= InventoryItem.minimum_stock_level
        )

    total = query.count()

    items = (
        query.order_by(
            InventoryItem.id.desc()
        )
        .offset(
            (page - 1) * page_size
        )
        .limit(page_size)
        .all()
    )

    return InventoryItemListResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=get_total_pages(
            total,
            page_size,
        ),
    )


@router.get(
    "/items/{item_id}",
    response_model=InventoryItemResponse,
)
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    item = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.id == item_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found.",
        )

    return item


@router.put(
    "/items/{item_id}",
    response_model=InventoryItemResponse,
)
def update_item(
    item_id: int,
    data: InventoryItemUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    item = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.id == item_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found.",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "category_id" in update_data:

        category = (
            db.query(InventoryCategory)
            .filter(
                InventoryCategory.id
                == update_data["category_id"]
            )
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Inventory category not found.",
            )

    if "supplier_id" in update_data:

        if update_data["supplier_id"] is not None:

            supplier = (
                db.query(InventorySupplier)
                .filter(
                    InventorySupplier.id
                    == update_data["supplier_id"]
                )
                .first()
            )

            if not supplier:
                raise HTTPException(
                    status_code=404,
                    detail="Supplier not found.",
                )

    if "status" in update_data:
        update_data["status"] = (
            validate_item_status(
                update_data["status"]
            )
        )

        update_data["is_active"] = (
            update_data["status"]
            == "ACTIVE"
        )

    for key, value in update_data.items():
        setattr(
            item,
            key,
            value,
        )

    db.commit()
    db.refresh(item)

    return item


@router.delete(
    "/items/{item_id}",
)
def archive_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    item = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.id == item_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found.",
        )

    item.is_active = False
    item.status = "INACTIVE"

    db.commit()

    return {
        "message": "Inventory item archived successfully."
    }


@router.patch(
    "/items/{item_id}/restore",
)
def restore_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    item = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.id == item_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found.",
        )

    item.is_active = True
    item.status = "ACTIVE"

    db.commit()

    return {
        "message": "Inventory item restored successfully."
    }


# ============================================================
# STOCK MOVEMENTS
# ============================================================

@router.post(
    "/movements",
)
def create_inventory_movement(
    data: InventoryMovementCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    movement_type = validate_movement_type(
        data.movement_type
    )

    item = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.id == data.item_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found.",
        )

    if not item.is_active:
        raise HTTPException(
            status_code=400,
            detail="Inventory item is inactive.",
        )

    supplier = None

    if data.supplier_id is not None:

        supplier = (
            db.query(InventorySupplier)
            .filter(
                InventorySupplier.id
                == data.supplier_id
            )
            .first()
        )

        if not supplier:
            raise HTTPException(
                status_code=404,
                detail="Supplier not found.",
            )

    unit_cost = (
        data.unit_cost
        if data.unit_cost is not None
        else item.unit_cost
    )

    total_value = (
        data.quantity * unit_cost
    )

    stock_in_types = {
        "STOCK_IN",
        "RETURN",
        "ADJUSTMENT_IN",
        "TRANSFER_IN",
    }

    stock_out_types = {
        "STOCK_OUT",
        "ISSUE",
        "ADJUSTMENT_OUT",
        "TRANSFER_OUT",
    }

    if movement_type in stock_in_types:

        item.current_quantity = (
            item.current_quantity
            + data.quantity
        )

        if unit_cost is not None:
            item.unit_cost = unit_cost

    elif movement_type in stock_out_types:

        if (
            item.current_quantity
            < data.quantity
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Insufficient stock. "
                    f"Available: "
                    f"{item.current_quantity}, "
                    f"requested: "
                    f"{data.quantity}"
                ),
            )

        item.current_quantity = (
            item.current_quantity
            - data.quantity
        )

    movement_number = (
        generate_movement_number(db)
    )

    movement = InventoryMovement(
        movement_number=movement_number,
        item_id=item.id,
        movement_type=movement_type,
        quantity=data.quantity,
        unit_cost=unit_cost,
        total_value=total_value,
        reference_number=data.reference_number,
        supplier_id=data.supplier_id,
        performed_by=current_user.id,
        remarks=data.remarks,
    )

    db.add(movement)

    # IMPORTANT:
    # We need the movement ID before creating
    # the accounting expense.
    db.flush()

    accounting_expense = None

    # ========================================================
    # INVENTORY → ACCOUNTING
    # ========================================================

    if (
        movement_type == "STOCK_IN"
        and data.create_accounting_expense
    ):
        expense_category = (
            validate_expense_category(
                data.expense_category
            )
        )

        expense_transaction_number = (
            generate_expense_transaction_number(
                db
            )
        )

        accounting_expense = AccountingExpense(
            transaction_number=(
                expense_transaction_number
            ),

            transaction_date=date.today(),

            expense_category=(
                expense_category
            ),

            description=(
                f"Inventory purchase - "
                f"{item.item_name}"
            ),

            amount=total_value,

            payment_method=None,

            reference_number=(
                data.reference_number
            ),

            vendor_name=(
                supplier.supplier_name
                if supplier
                else None
            ),

            status="COMPLETED",

            notes=data.remarks,

            created_by=current_user.id,

            # REAL DATABASE RELATIONSHIP
            inventory_movement_id=movement.id,
        )

        db.add(accounting_expense)

    db.commit()

    db.refresh(movement)

    if accounting_expense:
        db.refresh(accounting_expense)

    return {
        "message": (
            "Inventory movement created successfully."
        ),

        "movement": {
            "id": movement.id,
            "movement_number": (
                movement.movement_number
            ),
            "item_id": movement.item_id,
            "movement_type": (
                movement.movement_type
            ),
            "quantity": movement.quantity,
            "unit_cost": movement.unit_cost,
            "total_value": movement.total_value,
        },

        "accounting": (
            {
                "created": True,
                "expense_id": (
                    accounting_expense.id
                    if accounting_expense
                    else None
                ),
                "transaction_number": (
                    accounting_expense.transaction_number
                    if accounting_expense
                    else None
                ),
                "amount": (
                    accounting_expense.amount
                    if accounting_expense
                    else None
                ),
                "inventory_movement_id": (
                    accounting_expense.inventory_movement_id
                    if accounting_expense
                    else None
                ),
            }
            if accounting_expense
            else {
                "created": False,
                "message": (
                    "No accounting expense was "
                    "created for this movement."
                ),
            }
        ),
    }


# ============================================================
# MOVEMENT LIST
# ============================================================

@router.get(
    "/movements",
    response_model=InventoryMovementListResponse,
)
def list_movements(
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    item_id: int | None = None,
    supplier_id: int | None = None,
    movement_type: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    query = db.query(
        InventoryMovement
    )

    if item_id is not None:
        query = query.filter(
            InventoryMovement.item_id
            == item_id
        )

    if supplier_id is not None:
        query = query.filter(
            InventoryMovement.supplier_id
            == supplier_id
        )

    if movement_type:

        movement_type = validate_movement_type(
            movement_type
        )

        query = query.filter(
            InventoryMovement.movement_type
            == movement_type
        )

    if search:

        search_value = f"%{search.strip()}%"

        query = (
            query
            .join(
                InventoryItem,
                InventoryMovement.item_id
                == InventoryItem.id,
            )
            .filter(
                or_(
                    InventoryMovement.movement_number.ilike(
                        search_value
                    ),
                    InventoryMovement.reference_number.ilike(
                        search_value
                    ),
                    InventoryItem.item_code.ilike(
                        search_value
                    ),
                    InventoryItem.item_name.ilike(
                        search_value
                    ),
                )
            )
        )

    total = query.count()

    movements = (
        query.order_by(
            InventoryMovement.id.desc()
        )
        .offset(
            (page - 1) * page_size
        )
        .limit(page_size)
        .all()
    )

    return InventoryMovementListResponse(
        items=movements,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=get_total_pages(
            total,
            page_size,
        ),
    )


# ============================================================
# MOVEMENT DETAILS
# ============================================================

@router.get(
    "/movements/{movement_id}",
    response_model=InventoryMovementResponse,
)
def get_movement(
    movement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    movement = (
        db.query(InventoryMovement)
        .filter(
            InventoryMovement.id
            == movement_id
        )
        .first()
    )

    if not movement:
        raise HTTPException(
            status_code=404,
            detail="Inventory movement not found.",
        )

    return movement


# ============================================================
# ACCOUNTING RECONCILIATION
# ============================================================

@router.get(
    "/reconciliation",
    response_model=list[
        InventoryAccountingReconciliationResponse
    ],
)
def inventory_accounting_reconciliation(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    movements = (
        db.query(
            InventoryMovement,
            InventoryItem,
        )
        .join(
            InventoryItem,
            InventoryMovement.item_id
            == InventoryItem.id,
        )
        .filter(
            InventoryMovement.movement_type
            == "STOCK_IN"
        )
        .order_by(
            InventoryMovement.id.desc()
        )
        .all()
    )

    results = []

    for movement, item in movements:

        accounting_expense = (
            db.query(AccountingExpense)
            .filter(
                AccountingExpense.inventory_movement_id
                == movement.id
            )
            .first()
        )

        if accounting_expense is None:

            reconciliation_status = (
                "MISSING_ACCOUNTING"
            )

            accounting_expense_id = None
            accounting_transaction_number = None
            accounting_amount = None
            accounting_status = None

        else:

            accounting_expense_id = (
                accounting_expense.id
            )

            accounting_transaction_number = (
                accounting_expense.transaction_number
            )

            accounting_amount = (
                accounting_expense.amount
            )

            accounting_status = (
                accounting_expense.status
            )

            inventory_amount = (
                movement.total_value
                or Decimal("0")
            )

            expense_amount = (
                accounting_expense.amount
                or Decimal("0")
            )

            if inventory_amount != expense_amount:

                reconciliation_status = (
                    "AMOUNT_MISMATCH"
                )

            elif (
                accounting_expense.status
                != "COMPLETED"
            ):

                reconciliation_status = (
                    "ACCOUNTING_NOT_COMPLETED"
                )

            else:

                reconciliation_status = "MATCHED"

        results.append(
            InventoryAccountingReconciliationResponse(
                movement_id=movement.id,

                movement_number=(
                    movement.movement_number
                ),

                item_id=item.id,

                item_name=item.item_name,

                movement_type=(
                    movement.movement_type
                ),

                quantity=movement.quantity,

                unit_cost=movement.unit_cost,

                inventory_total_value=(
                    movement.total_value
                ),

                accounting_expense_id=(
                    accounting_expense_id
                ),

                accounting_transaction_number=(
                    accounting_transaction_number
                ),

                accounting_amount=(
                    accounting_amount
                ),

                accounting_status=(
                    accounting_status
                ),

                reconciliation_status=(
                    reconciliation_status
                ),
            )
        )

    return results


# ============================================================
# SINGLE MOVEMENT RECONCILIATION
# ============================================================

@router.get(
    "/movements/{movement_id}/reconciliation",
    response_model=InventoryAccountingReconciliationResponse,
)
def get_movement_reconciliation(
    movement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "ACCOUNTANT",
        )
    ),
):
    movement = (
        db.query(InventoryMovement)
        .filter(
            InventoryMovement.id
            == movement_id
        )
        .first()
    )

    if not movement:
        raise HTTPException(
            status_code=404,
            detail="Inventory movement not found.",
        )

    item = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.id
            == movement.item_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found.",
        )

    accounting_expense = (
        db.query(AccountingExpense)
        .filter(
            AccountingExpense.inventory_movement_id
            == movement.id
        )
        .first()
    )

    if accounting_expense is None:

        reconciliation_status = (
            "MISSING_ACCOUNTING"
        )

    elif (
        (movement.total_value or Decimal("0"))
        !=
        (accounting_expense.amount or Decimal("0"))
    ):

        reconciliation_status = (
            "AMOUNT_MISMATCH"
        )

    elif (
        accounting_expense.status
        != "COMPLETED"
    ):

        reconciliation_status = (
            "ACCOUNTING_NOT_COMPLETED"
        )

    else:

        reconciliation_status = "MATCHED"

    return InventoryAccountingReconciliationResponse(
        movement_id=movement.id,

        movement_number=(
            movement.movement_number
        ),

        item_id=item.id,

        item_name=item.item_name,

        movement_type=(
            movement.movement_type
        ),

        quantity=movement.quantity,

        unit_cost=movement.unit_cost,

        inventory_total_value=(
            movement.total_value
        ),

        accounting_expense_id=(
            accounting_expense.id
            if accounting_expense
            else None
        ),

        accounting_transaction_number=(
            accounting_expense.transaction_number
            if accounting_expense
            else None
        ),

        accounting_amount=(
            accounting_expense.amount
            if accounting_expense
            else None
        ),

        accounting_status=(
            accounting_expense.status
            if accounting_expense
            else None
        ),

        reconciliation_status=(
            reconciliation_status
        ),
    )