import secrets
import string

from sqlalchemy.orm import Session

from models.admission import Admission
from models.student import Student
from models.parent import Parent
from models.parent_student import ParentStudent
from models.user import User
from models.fee_account import FeeAccount

from auth.security import hash_password

from fee_service import (
    get_fee_structure_for_student,
    calculate_fee_due_date,
)


def generate_temporary_password(length: int = 12) -> str:
    """Generate a secure temporary password."""

    characters = (
        string.ascii_letters
        + string.digits
        + "!@#$%"
    )

    return "".join(
        secrets.choice(characters)
        for _ in range(length)
    )


def build_student_email(
    application_number: str,
) -> str:
    return (
        f"student."
        f"{application_number.lower()}"
        f"@edunexus.local"
    )


def build_parent_email(
    application_number: str,
) -> str:
    return (
        f"parent."
        f"{application_number.lower()}"
        f"@edunexus.local"
    )


def enroll_admission(
    db: Session,
    admission: Admission,
) -> dict:
    """
    Convert an APPROVED admission into a complete
    EduNexus enrollment bundle.

    Creates:

    1. Student user account
    2. Student
    3. Parent user account
    4. Parent
    5. Parent-Student relationship
    6. Fee account
    7. Automatic fee due date
    8. Admission -> ENROLLED

    All database changes are treated as one transaction.
    """

    try:

        # --------------------------------------------------------
        # VALIDATE ADMISSION
        # --------------------------------------------------------

        if not admission.is_active:
            raise ValueError(
                "This admission application is archived."
            )

        if admission.status != "APPROVED":
            raise ValueError(
                "Only APPROVED admissions can be enrolled."
            )

        # --------------------------------------------------------
        # PREVENT DUPLICATE ENROLLMENT
        # --------------------------------------------------------

        existing_student = (
            db.query(Student)
            .filter(
                Student.admission_number
                == admission.application_number
            )
            .first()
        )

        if existing_student:
            raise ValueError(
                "This admission is already enrolled."
            )

        # --------------------------------------------------------
        # FIND ACTIVE FEE STRUCTURE
        # --------------------------------------------------------

        fee_structure = get_fee_structure_for_student(
            db=db,
            class_name=admission.applying_class,
            academic_year=admission.academic_year,
        )

        if not fee_structure:
            raise ValueError(
                "No active fee structure found for "
                f"class {admission.applying_class} "
                f"and academic year "
                f"{admission.academic_year}."
            )

        # --------------------------------------------------------
        # BUILD LOGIN EMAILS
        # --------------------------------------------------------

        student_email = build_student_email(
            admission.application_number
        )

        parent_email = (
            admission.parent_email
            if admission.parent_email
            else build_parent_email(
                admission.application_number
            )
        )

        # --------------------------------------------------------
        # PREVENT DUPLICATE USER ACCOUNTS
        # --------------------------------------------------------

        existing_student_user = (
            db.query(User)
            .filter(
                User.email == student_email
            )
            .first()
        )

        if existing_student_user:
            raise ValueError(
                "Student account email already exists."
            )

        existing_parent_user = (
            db.query(User)
            .filter(
                User.email == parent_email
            )
            .first()
        )

        if existing_parent_user:
            raise ValueError(
                "Parent account email already exists."
            )

        # --------------------------------------------------------
        # GENERATE TEMPORARY PASSWORDS
        # --------------------------------------------------------

        student_password = (
            generate_temporary_password()
        )

        parent_password = (
            generate_temporary_password()
        )

        # --------------------------------------------------------
        # CREATE STUDENT USER
        # --------------------------------------------------------

        student_user = User(
            full_name=(
                f"{admission.first_name} "
                f"{admission.last_name or ''}"
            ).strip(),

            email=student_email,

            password_hash=hash_password(
                student_password
            ),

            role="STUDENT",
            is_active=True,
        )

        db.add(student_user)
        db.flush()

        # --------------------------------------------------------
        # CREATE STUDENT
        # --------------------------------------------------------

        student = Student(
            user_id=student_user.id,

            admission_number=(
                admission.application_number
            ),

            first_name=admission.first_name,
            last_name=admission.last_name,

            date_of_birth=admission.date_of_birth,
            gender=admission.gender,

            # Admission currently stores the
            # parent's contact information.
            phone=None,

            address=admission.parent_address,

            class_name=admission.applying_class,

            section=admission.applying_section,

            academic_year=admission.academic_year,

            admission_date=admission.application_date,

            status="ACTIVE",
        )

        db.add(student)
        db.flush()

        # --------------------------------------------------------
        # CREATE PARENT USER
        # --------------------------------------------------------

        parent_user = User(
            full_name=admission.parent_name,

            email=parent_email,

            password_hash=hash_password(
                parent_password
            ),

            role="PARENT",
            is_active=True,
        )

        db.add(parent_user)
        db.flush()

        # --------------------------------------------------------
        # CREATE PARENT
        # --------------------------------------------------------

        parent_name_parts = (
            admission.parent_name
            .strip()
            .split()
        )

        parent_first_name = (
            parent_name_parts[0]
            if parent_name_parts
            else "Parent"
        )

        parent_last_name = (
            " ".join(parent_name_parts[1:])
            if len(parent_name_parts) > 1
            else None
        )

        parent = Parent(
            user_id=parent_user.id,

            first_name=parent_first_name,
            last_name=parent_last_name,

            relationship=(
                admission.parent_relationship
            ),

            phone=admission.parent_phone,

            alternate_phone=None,

            email=admission.parent_email,

            address=admission.parent_address,

            occupation=admission.parent_occupation,

            status="ACTIVE",
        )

        db.add(parent)
        db.flush()

        # --------------------------------------------------------
        # CREATE PARENT-STUDENT RELATIONSHIP
        # --------------------------------------------------------

        parent_student = ParentStudent(
            parent_id=parent.id,

            student_id=student.id,

            relationship=(
                admission.parent_relationship
            ),

            status="ACTIVE",
        )

        db.add(parent_student)
        db.flush()

        # --------------------------------------------------------
        # CALCULATE FEE DUE DATE
        # --------------------------------------------------------

        fee_due_date = calculate_fee_due_date(
            db=db,
            academic_year=admission.academic_year,
        )

        # --------------------------------------------------------
        # CREATE FEE ACCOUNT
        # --------------------------------------------------------

        fee_account = FeeAccount(
            student_id=student.id,

            academic_year=(
                admission.academic_year
            ),

            total_due=fee_structure.total_fee,

            total_paid=0,

            balance=fee_structure.total_fee,

            status="ACTIVE",

            due_date=fee_due_date,
        )

        db.add(fee_account)
        db.flush()

        # --------------------------------------------------------
        # COMPLETE ADMISSION
        # --------------------------------------------------------

        admission.status = "ENROLLED"

        # --------------------------------------------------------
        # COMMIT COMPLETE TRANSACTION
        # --------------------------------------------------------

        db.commit()

        # --------------------------------------------------------
        # REFRESH CREATED RECORDS
        # --------------------------------------------------------

        db.refresh(admission)
        db.refresh(student)
        db.refresh(student_user)
        db.refresh(parent)
        db.refresh(parent_user)
        db.refresh(parent_student)
        db.refresh(fee_account)

        # --------------------------------------------------------
        # RETURN RESULT
        # --------------------------------------------------------

        return {
            "success": True,

            "admission_id": admission.id,

            "application_number": (
                admission.application_number
            ),

            "student_id": student.id,

            "student_user_id": student_user.id,

            "parent_id": parent.id,

            "parent_user_id": parent_user.id,

            "parent_student_id": parent_student.id,

            "fee_account_id": fee_account.id,

            "admission_status": (
                admission.status
            ),

            "student_status": (
                student.status
            ),

            "parent_status": (
                parent.status
            ),

            "fee_account_status": (
                fee_account.status
            ),

            "student_login_email": (
                student_email
            ),

            "student_temporary_password": (
                student_password
            ),

            "parent_login_email": (
                parent_email
            ),

            "parent_temporary_password": (
                parent_password
            ),

            "message": (
                "Admission enrolled successfully. "
                "Student, parent, relationship, "
                "and fee account were created."
            ),
        }

    except ValueError:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise