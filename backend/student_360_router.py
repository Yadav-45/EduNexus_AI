from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.student import Student
from models.parent import Parent
from models.parent_student import ParentStudent
from auth.dependencies import require_roles

from student_360_schemas import (
    Student360Response,
    Student360Parent,
)


router = APIRouter(
    prefix="/student-360",
    tags=["Student 360"],
)


@router.get(
    "/{student_id}",
    response_model=Student360Response,
)
def get_student_360(
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

    relationships = (
        db.query(ParentStudent, Parent)
        .join(
            Parent,
            Parent.id == ParentStudent.parent_id,
        )
        .filter(
            ParentStudent.student_id == student_id
        )
        .order_by(ParentStudent.id.desc())
        .all()
    )

    parents = []

    for relationship, parent in relationships:
        parents.append(
            Student360Parent(
                relationship_id=relationship.id,
                parent_id=parent.id,
                parent_name=" ".join(
                    filter(
                        None,
                        [
                            parent.first_name,
                            parent.last_name,
                        ],
                    )
                ),
                relationship=relationship.relationship,
                phone=parent.phone,
                alternate_phone=parent.alternate_phone,
                email=parent.email,
                address=parent.address,
            )
        )

    return Student360Response(
        id=student.id,
        admission_number=student.admission_number,
        first_name=student.first_name,
        last_name=student.last_name,
        date_of_birth=student.date_of_birth,
        gender=student.gender,
        phone=student.phone,
        address=student.address,
        class_name=student.class_name,
        section=student.section,
        academic_year=student.academic_year,
        admission_date=student.admission_date,
        status=student.status,
        parents=parents,
    )