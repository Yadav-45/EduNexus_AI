from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from course_model import Course
from progress_model import Progress

router = APIRouter()


class LessonCompletion(BaseModel):
    lesson_number: int


@router.get("/courses")
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    return courses


@router.get("/courses/{course_id}")
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return course


@router.post("/courses/{course_id}/complete")
def complete_lesson(
    course_id: int,
    lesson: LessonCompletion,
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if lesson.lesson_number < 1 or lesson.lesson_number > 8:
        raise HTTPException(
            status_code=400,
            detail="Lesson number must be between 1 and 8"
        )

    existing_progress = (
        db.query(Progress)
        .filter(
            Progress.course_id == course_id,
            Progress.lesson_number == lesson.lesson_number
        )
        .first()
    )

    if existing_progress:
        existing_progress.lesson_completed = True
    else:
        new_progress = Progress(
            course_id=course_id,
            lesson_number=lesson.lesson_number,
            lesson_completed=True
        )

        db.add(new_progress)

    db.commit()

    completed_lessons = (
        db.query(Progress)
        .filter(
            Progress.course_id == course_id,
            Progress.lesson_completed == True
        )
        .all()
    )

    completed_numbers = sorted(
        [item.lesson_number for item in completed_lessons]
    )

    progress = (len(completed_numbers) / 8) * 100

    return {
        "message": "Lesson completed successfully",
        "course_id": course_id,
        "lesson_number": lesson.lesson_number,
        "completed_lessons": completed_numbers,
        "progress": progress
    }


@router.get("/courses/{course_id}/progress")
def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    completed_lessons = (
        db.query(Progress)
        .filter(
            Progress.course_id == course_id,
            Progress.lesson_completed == True
        )
        .all()
    )

    completed_numbers = sorted(
        [item.lesson_number for item in completed_lessons]
    )

    progress = (len(completed_numbers) / 8) * 100

    return {
        "course_id": course_id,
        "progress": progress,
        "completed_lessons": completed_numbers
    }