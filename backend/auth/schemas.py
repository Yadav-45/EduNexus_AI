from enum import Enum

from pydantic import BaseModel, EmailStr


class UserRole(str, Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    ACCOUNTANT = "ACCOUNTANT"
    TEACHER = "TEACHER"
    PARENT = "PARENT"
    STUDENT = "STUDENT"


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.STUDENT


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str