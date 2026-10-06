from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.student import Student
from auth.dependencies import require_roles

from student_schemas import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
)

from core.query_params import SearchParams
from core.responses import PaginatedResponse, PaginationMeta


router = APIRouter(
    prefix="/students",
    tags=["Student Management"],
)


@router.post(
    "",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_student(
    request: StudentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    existing_student = (
        db.query(Student)
        .filter(
            Student.admission_number
            == request.admission_number
        )
        .first()
    )

    if existing_student:
        raise HTTPException(
            status_code=400,
            detail="Admission number is already registered",
        )

    student = Student(
        admission_number=request.admission_number,
        first_name=request.first_name,
        last_name=request.last_name,
        date_of_birth=request.date_of_birth,
        gender=request.gender,
        phone=request.phone,
        address=request.address,
        class_name=request.class_name,
        section=request.section,
        academic_year=request.academic_year,
        admission_date=request.admission_date,
        status=request.status,
    )

    db.add(student)
    db.commit()
    db.refresh(student)

    return student


@router.get(
    "",
    response_model=PaginatedResponse[StudentResponse],
)
def get_students(
    params: SearchParams = Depends(),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN", "TEACHER")
    ),
):
    query = db.query(Student)

    # Search across important student fields
    if params.search:
        search_term = f"%{params.search.strip()}%"

        query = query.filter(
            (
                Student.first_name.ilike(search_term)
                | Student.last_name.ilike(search_term)
                | Student.admission_number.ilike(search_term)
                | Student.phone.ilike(search_term)
            )
        )

    # Filter by student status
    if params.status:
        query = query.filter(
            Student.status == params.status
        )

    # Total records BEFORE pagination
    total = query.count()

    # Sorting
    allowed_sort_fields = {
        "id": Student.id,
        "first_name": Student.first_name,
        "last_name": Student.last_name,
        "admission_number": Student.admission_number,
        "status": Student.status,
        "class_name": Student.class_name,
        "academic_year": Student.academic_year,
    }

    sort_column = allowed_sort_fields.get(
        params.sort_by,
        Student.id,
    )

    if params.sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Database-level pagination
    students = (
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
        data=students,
        pagination=PaginationMeta(
            page=params.page,
            page_size=params.page_size,
            total=total,
            total_pages=total_pages,
        ),
    )


@router.get(
    "/{student_id}",
    response_model=StudentResponse,
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "TEACHER",
            "PARENT",
            "STUDENT",
        )
    ),
):
    student = (
        db.query(Student)
        .filter(Student.id == student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    return student


@router.put(
    "/{student_id}",
    response_model=StudentResponse,
)
def update_student(
    student_id: int,
    request: StudentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    student = (
        db.query(Student)
        .filter(Student.id == student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    update_data = request.model_dump(
        exclude_unset=True
    )

    if "admission_number" in update_data:
        existing_student = (
            db.query(Student)
            .filter(
                Student.admission_number
                == update_data["admission_number"],
                Student.id != student_id,
            )
            .first()
        )

        if existing_student:
            raise HTTPException(
                status_code=400,
                detail="Admission number is already registered",
            )

    for field, value in update_data.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)

    return student


@router.delete(
    "/{student_id}",
)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    student = (
        db.query(Student)
        .filter(Student.id == student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    db.delete(student)
    db.commit()

    return {
        "message": "Student deleted successfully",
        "student_id": student_id,
    }