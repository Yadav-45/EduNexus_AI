from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.parent import Parent
from auth.dependencies import require_roles
from parent_schemas import (
    ParentCreate,
    ParentUpdate,
    ParentResponse,
)


router = APIRouter(
    prefix="/parents",
    tags=["Parent Management"],
)


@router.post(
    "",
    response_model=ParentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_parent(
    request: ParentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    parent = Parent(
        first_name=request.first_name,
        last_name=request.last_name,
        relationship=request.relationship,
        phone=request.phone,
        alternate_phone=request.alternate_phone,
        email=request.email,
        address=request.address,
        occupation=request.occupation,
        status=request.status,
    )

    db.add(parent)
    db.commit()
    db.refresh(parent)

    return parent


@router.get(
    "",
    response_model=list[ParentResponse],
)
def get_parents(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    parents = (
        db.query(Parent)
        .order_by(Parent.id.desc())
        .all()
    )

    return parents


@router.get(
    "/{parent_id}",
    response_model=ParentResponse,
)
def get_parent(
    parent_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    parent = (
        db.query(Parent)
        .filter(Parent.id == parent_id)
        .first()
    )

    if not parent:
        raise HTTPException(
            status_code=404,
            detail="Parent not found",
        )

    return parent


@router.put(
    "/{parent_id}",
    response_model=ParentResponse,
)
def update_parent(
    parent_id: int,
    request: ParentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    parent = (
        db.query(Parent)
        .filter(Parent.id == parent_id)
        .first()
    )

    if not parent:
        raise HTTPException(
            status_code=404,
            detail="Parent not found",
        )

    update_data = request.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(parent, field, value)

    db.commit()
    db.refresh(parent)

    return parent


@router.delete(
    "/{parent_id}",
)
def delete_parent(
    parent_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    parent = (
        db.query(Parent)
        .filter(Parent.id == parent_id)
        .first()
    )

    if not parent:
        raise HTTPException(
            status_code=404,
            detail="Parent not found",
        )

    db.delete(parent)
    db.commit()

    return {
        "message": "Parent deleted successfully",
        "parent_id": parent_id,
    }