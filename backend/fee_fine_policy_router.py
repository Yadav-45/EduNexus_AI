from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from fee_fine_policy_schemas import (
    FeeFinePolicyCreate,
    FeeFinePolicyResponse,
    FeeFinePolicyUpdate,
)

from fee_fine_policy import (
    create_fee_fine_policy,
    update_fee_fine_policy,
)


router = APIRouter(
    prefix="/fee-dashboard",
    tags=["Fee Fine Policy"],
)


@router.post(
    "/fine-policies",
    response_model=FeeFinePolicyResponse,
)
def create_policy(
    payload: FeeFinePolicyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    return create_fee_fine_policy(
        db=db,
        data=payload.model_dump(),
    )


@router.put(
    "/fine-policies/{policy_id}",
    response_model=FeeFinePolicyResponse,
)
def update_policy(
    payload: FeeFinePolicyUpdate,
    policy_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    return update_fee_fine_policy(
        db=db,
        policy_id=policy_id,
        data=payload.model_dump(
            exclude_unset=True
        ),
    )


@router.get(
    "/fine-policies",
    response_model=list[FeeFinePolicyResponse],
)
def list_policies(
    academic_year: str | None = Query(
        default=None,
        max_length=20,
    ),
    status: str | None = Query(
        default=None,
        max_length=30,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    query = db.query(FeeFinePolicy)

    if academic_year:
        query = query.filter(
            FeeFinePolicy.academic_year
            == academic_year
        )

    if status:
        query = query.filter(
            FeeFinePolicy.status
            == status.upper()
        )

    return (
        query
        .order_by(FeeFinePolicy.id.desc())
        .all()
    )