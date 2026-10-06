from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from assignment_model import Assignment

router = APIRouter()


def create_default_assignments(db: Session):
    existing = db.query(Assignment).count()

    if existing > 0:
        return

    assignments = [
        Assignment(
            course_id=1,
            title="Python Basics Practice",
            description="Write a simple Python program using variables and data types.",
            due_date="2026-10-05",
            completed=False,
        ),
        Assignment(
            course_id=1,
            title="Loops and Functions Exercise",
            description="Create a Python program using loops and at least one function.",
            due_date="2026-10-10",
            completed=False,
        ),
        Assignment(
            course_id=1,
            title="Final Python Project",
            description="Build a small Python project using the concepts learned in the course.",
            due_date="2026-10-20",
            completed=False,
        ),
    ]

    db.add_all(assignments)
    db.commit()


@router.get("/assignments")
def get_assignments(db: Session = Depends(get_db)):
    create_default_assignments(db)

    assignments = (
        db.query(Assignment)
        .order_by(Assignment.id)
        .all()
    )

    return assignments


@router.post("/assignments/{assignment_id}/complete")
def complete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db)
):
    assignment = (
        db.query(Assignment)
        .filter(Assignment.id == assignment_id)
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    assignment.completed = True

    db.commit()
    db.refresh(assignment)

    return {
        "message": "Assignment completed successfully",
        "assignment_id": assignment.id,
        "completed": assignment.completed,
    }