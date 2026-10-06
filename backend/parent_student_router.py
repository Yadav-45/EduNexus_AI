from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.parent import Parent
from models.student import Student
from models.parent_student import ParentStudent
from auth.dependencies import require_roles

from parent_student_schemas import (
    ParentStudentCreate,
    ParentStudentResponse,
)


router = APIRouter(
    prefix="/parent-students",
    tags=["Parent Student Relationships"],
)


@router.post(
    "",
    response_model=ParentStudentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_parent_student_relationship(
    request: ParentStudentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    parent = (
        db.query(Parent)
        .filter(Parent.id == request.parent_id)
        .first()
    )

    if not parent:
        raise HTTPException(
            status_code=404,
            detail="Parent not found",
        )

    student = (
        db.query(Student)
        .filter(Student.id == request.student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    existing_relationship = (
        db.query(ParentStudent)
        .filter(
            ParentStudent.parent_id == request.parent_id,
            ParentStudent.student_id == request.student_id,
        )
        .first()
    )

    if existing_relationship:
        raise HTTPException(
            status_code=400,
            detail="This parent is already connected to this student",
        )

    relationship = ParentStudent(
        parent_id=request.parent_id,
        student_id=request.student_id,
        relationship=request.relationship,
        status=request.status,
    )

    db.add(relationship)
    db.commit()
    db.refresh(relationship)

    return relationship


@router.get(
    "",
    response_model=list[ParentStudentResponse],
)
def get_parent_student_relationships(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    relationships = (
        db.query(ParentStudent)
        .order_by(ParentStudent.id.desc())
        .all()
    )

    return relationships


@router.get(
    "/parent/{parent_id}",
    response_model=list[ParentStudentResponse],
)
def get_students_for_parent(
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

    relationships = (
        db.query(ParentStudent)
        .filter(
            ParentStudent.parent_id == parent_id
        )
        .order_by(ParentStudent.id.desc())
        .all()
    )

    return relationships


@router.get(
    "/student/{student_id}",
    response_model=list[ParentStudentResponse],
)
def get_parents_for_student(
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

    relationships = (
        db.query(ParentStudent)
        .filter(
            ParentStudent.student_id == student_id
        )
        .order_by(ParentStudent.id.desc())
        .all()
    )

    return relationships


@router.delete(
    "/{relationship_id}",
)
def delete_parent_student_relationship(
    relationship_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    relationship = (
        db.query(ParentStudent)
        .filter(
            ParentStudent.id == relationship_id
        )
        .first()
    )

    if not relationship:
        raise HTTPException(
            status_code=404,
            detail="Parent-student relationship not found",
        )

    db.delete(relationship)
    db.commit()

    return {
        "message": "Parent-student relationship deleted successfully",
        "relationship_id": relationship_id,
    }