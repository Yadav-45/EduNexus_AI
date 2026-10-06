from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from database import get_db
from models.user import User
from auth.dependencies import get_current_user


router = APIRouter()


class ProfileUpdate(BaseModel):
    full_name: str
    email: EmailStr


@router.get("/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
    }


@router.put("/profile")
def update_profile(
    profile: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.full_name = profile.full_name.strip()
    current_user.email = profile.email.strip()

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
    }