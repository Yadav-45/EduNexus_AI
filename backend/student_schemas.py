from datetime import date

from pydantic import BaseModel, ConfigDict


class StudentCreate(BaseModel):
    admission_number: str
    first_name: str
    last_name: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    phone: str | None = None
    address: str | None = None
    class_name: str | None = None
    section: str | None = None
    academic_year: str | None = None
    admission_date: date | None = None
    status: str = "ACTIVE"


class StudentUpdate(BaseModel):
    admission_number: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    phone: str | None = None
    address: str | None = None
    class_name: str | None = None
    section: str | None = None
    academic_year: str | None = None
    admission_date: date | None = None
    status: str | None = None


class StudentResponse(BaseModel):
    id: int
    user_id: int | None
    admission_number: str
    first_name: str
    last_name: str | None
    date_of_birth: date | None
    gender: str | None
    phone: str | None
    address: str | None
    class_name: str | None
    section: str | None
    academic_year: str | None
    admission_date: date | None
    status: str

    model_config = ConfigDict(
        from_attributes=True,
    )