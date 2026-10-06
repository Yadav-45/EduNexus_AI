from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from auth.dependencies import require_roles
from auth.security import hash_password


router = APIRouter(
    prefix="/users",
    tags=["User Management"],
)


class CreateUserRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str


class UpdateUserStatusRequest(BaseModel):
    is_active: bool


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    request: CreateUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    allowed_roles = {
        "ADMIN",
        "ACCOUNTANT",
        "TEACHER",
        "PARENT",
        "STUDENT",
    }

    if request.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid user role",
        )

    # ADMIN users cannot create another ADMIN.
    # Only the OWNER can create ADMIN accounts.
    if (
        current_user.role == "ADMIN"
        and request.role == "ADMIN"
    ):
        raise HTTPException(
            status_code=403,
            detail="Administrators cannot create another administrator",
        )

    existing_user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered",
        )

    user = User(
        full_name=request.full_name,
        email=request.email,
        password_hash=hash_password(request.password),
        role=request.role,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User created successfully",
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
    }


@router.get("")
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    users = (
        db.query(User)
        .order_by(User.id.desc())
        .all()
    )

    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
        }
        for user in users
    ]


@router.patch("/{user_id}/status")
def update_user_status(
    user_id: int,
    request: UpdateUserStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # Users cannot deactivate their own account.
    if (
        user.id == current_user.id
        and not request.is_active
    ):
        raise HTTPException(
            status_code=400,
            detail="You cannot deactivate your own account",
        )

    # ADMIN cannot deactivate an OWNER.
    if (
        current_user.role == "ADMIN"
        and user.role == "OWNER"
    ):
        raise HTTPException(
            status_code=403,
            detail="Administrators cannot change owner account status",
        )

    # ADMIN cannot deactivate another ADMIN.
    if (
        current_user.role == "ADMIN"
        and user.role == "ADMIN"
        and user.id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Administrators cannot change another administrator's status",
        )

    user.is_active = request.is_active

    db.commit()
    db.refresh(user)

    return {
        "message": "User status updated successfully",
        "user_id": user.id,
        "is_active": user.is_active,
    }