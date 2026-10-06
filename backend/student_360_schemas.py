from datetime import date

from pydantic import BaseModel


class Student360Parent(BaseModel):
    relationship_id: int
    parent_id: int
    parent_name: str
    relationship: str | None
    phone: str | None
    alternate_phone: str | None
    email: str | None
    address: str | None


class Student360Response(BaseModel):
    id: int
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
    parents: list[Student360Parent]