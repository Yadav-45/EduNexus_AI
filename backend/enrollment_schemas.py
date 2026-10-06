from typing import Optional

from pydantic import BaseModel


class EnrollmentResponse(BaseModel):
    success: bool

    admission_id: int
    application_number: str

    student_id: int
    student_user_id: int

    parent_id: int
    parent_user_id: int

    parent_student_id: int

    fee_account_id: int

    admission_status: str
    student_status: str
    parent_status: str
    fee_account_status: str

    student_login_email: str
    student_temporary_password: str

    parent_login_email: str
    parent_temporary_password: str

    message: str