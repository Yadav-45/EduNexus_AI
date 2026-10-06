from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.fee_account import FeeAccount
from models.student import Student
from auth.dependencies import require_roles

from fee_account_schemas import (
    FeeAccountUpdate,
    FeeAccountResponse,
)

from core.query_params import SearchParams
from core.responses import (
    PaginatedResponse,
    PaginationMeta,
)


router = APIRouter(
    prefix="/fee-accounts",
    tags=["Fee Management"],
)


@router.get(
    "",
    response_model=PaginatedResponse[
        FeeAccountResponse
    ],
)
def get_fee_accounts(
    params: SearchParams = Depends(),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    query = db.query(FeeAccount)

    if params.search:
        search_term = (
            f"%{params.search.strip()}%"
        )

        student_ids = (
            db.query(Student.id)
            .filter(
                Student.first_name.ilike(
                    search_term
                )
                | Student.last_name.ilike(
                    search_term
                )
                | Student.admission_number.ilike(
                    search_term
                )
            )
            .subquery()
        )

        query = query.filter(
            FeeAccount.student_id.in_(
                student_ids
            )
        )

    if params.status:
        query = query.filter(
            FeeAccount.status
            == params.status
        )

    total = query.count()

    allowed_sort_fields = {
        "id": FeeAccount.id,
        "student_id": FeeAccount.student_id,
        "academic_year":
            FeeAccount.academic_year,
        "total_due":
            FeeAccount.total_due,
        "total_paid":
            FeeAccount.total_paid,
        "balance":
            FeeAccount.balance,
        "status":
            FeeAccount.status,
    }

    sort_column = allowed_sort_fields.get(
        params.sort_by,
        FeeAccount.id,
    )

    if params.sort_order == "desc":
        query = query.order_by(
            sort_column.desc()
        )
    else:
        query = query.order_by(
            sort_column.asc()
        )

    accounts = (
        query
        .offset(params.offset)
        .limit(params.page_size)
        .all()
    )

    total_pages = (
        (total + params.page_size - 1)
        // params.page_size
        if total > 0
        else 0
    )

    return PaginatedResponse(
        data=accounts,
        pagination=PaginationMeta(
            page=params.page,
            page_size=params.page_size,
            total=total,
            total_pages=total_pages,
        ),
    )


@router.get(
    "/{fee_account_id}",
    response_model=FeeAccountResponse,
)
def get_fee_account(
    fee_account_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    account = (
        db.query(FeeAccount)
        .filter(
            FeeAccount.id
            == fee_account_id
        )
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Fee account not found",
        )

    return account


@router.put(
    "/{fee_account_id}",
    response_model=FeeAccountResponse,
)
def update_fee_account(
    fee_account_id: int,
    request: FeeAccountUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    account = (
        db.query(FeeAccount)
        .filter(
            FeeAccount.id
            == fee_account_id
        )
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Fee account not found",
        )

    update_data = request.model_dump(
        exclude_unset=True
    )

    if "total_due" in update_data:
        account.total_due = (
            update_data["total_due"]
        )

    if "total_paid" in update_data:
        account.total_paid = (
            update_data["total_paid"]
        )

    if "status" in update_data:
        account.status = (
            update_data["status"]
        )

    account.balance = (
        account.total_due
        - account.total_paid
    )

    if account.balance < 0:
        raise HTTPException(
            status_code=400,
            detail=(
                "Total paid cannot be greater "
                "than total due."
            ),
        )

    db.commit()
    db.refresh(account)

    return account