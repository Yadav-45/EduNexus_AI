from datetime import date
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from database import get_db

from models.exam import Exam

from exam_schemas import (
    ExamCreate,
    ExamUpdate,
    ExamResponse,
    ExamListItem,
    ExamListResponse,
    ExamSummary,
    ExamStatusUpdate,
    ExamPublishUpdate,
    ExamDashboardItem,
)


router = APIRouter(
    prefix="/exams",
    tags=["Examinations"],
)


# ============================================================
# HELPERS
# ============================================================

VALID_STATUSES = {
    "SCHEDULED",
    "ONGOING",
    "COMPLETED",
    "CANCELLED",
}


def generate_exam_code(db: Session) -> str:
    """
    Generate exam codes such as:
    EXAM-000001
    EXAM-000002
    """

    last_exam = (
        db.query(Exam)
        .order_by(Exam.id.desc())
        .first()
    )

    next_number = 1

    if last_exam and last_exam.exam_code:
        try:
            next_number = (
                int(last_exam.exam_code.split("-")[-1]) + 1
            )
        except (ValueError, IndexError):
            next_number = last_exam.id + 1

    return f"EXAM-{next_number:06d}"


def validate_marks(
    maximum_marks,
    passing_marks,
):
    if maximum_marks < 0:
        raise HTTPException(
            status_code=400,
            detail="Maximum marks cannot be negative.",
        )

    if passing_marks < 0:
        raise HTTPException(
            status_code=400,
            detail="Passing marks cannot be negative.",
        )

    if passing_marks > maximum_marks:
        raise HTTPException(
            status_code=400,
            detail="Passing marks cannot be greater than maximum marks.",
        )


# ============================================================
# CREATE EXAM
# ============================================================

@router.post(
    "",
    response_model=ExamResponse,
)
def create_exam(
    payload: ExamCreate,
    db: Session = Depends(get_db),
):
    validate_marks(
        payload.maximum_marks,
        payload.passing_marks,
    )

    if payload.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid status. Allowed values: "
                f"{', '.join(sorted(VALID_STATUSES))}"
            ),
        )

    # Prevent duplicate exam schedule
    existing = (
        db.query(Exam)
        .filter(
            Exam.academic_year == payload.academic_year,
            Exam.class_name == payload.class_name,
            Exam.section == payload.section,
            Exam.subject_name == payload.subject_name,
            Exam.exam_date == payload.exam_date,
            Exam.exam_name == payload.exam_name,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail=(
                "An exam already exists for this "
                "class, subject, date and exam name."
            ),
        )

    exam = Exam(
        exam_code=generate_exam_code(db),
        exam_name=payload.exam_name,
        exam_type=payload.exam_type,
        academic_year=payload.academic_year,
        term=payload.term,
        description=payload.description,
        class_name=payload.class_name,
        section=payload.section,
        subject_name=payload.subject_name,
        subject_code=payload.subject_code,
        exam_date=payload.exam_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        duration_minutes=payload.duration_minutes,
        room_number=payload.room_number,
        maximum_marks=payload.maximum_marks,
        passing_marks=payload.passing_marks,
        status=payload.status,
        is_published=payload.is_published,
        instructions=payload.instructions,
        remarks=payload.remarks,
    )

    db.add(exam)
    db.commit()
    db.refresh(exam)

    return exam


# ============================================================
# LIST EXAMS
# ============================================================

@router.get(
    "",
    response_model=ExamListResponse,
)
def list_exams(
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=25,
        ge=1,
        le=100,
    ),
    search: str | None = Query(
        default=None,
    ),
    academic_year: str | None = Query(
        default=None,
    ),
    exam_type: str | None = Query(
        default=None,
    ),
    class_name: str | None = Query(
        default=None,
    ),
    section: str | None = Query(
        default=None,
    ),
    subject_name: str | None = Query(
        default=None,
    ),
    status: str | None = Query(
        default=None,
    ),
    is_published: bool | None = Query(
        default=None,
    ),
    exam_date: date | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Exam)

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    if search:
        search_term = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Exam.exam_code.ilike(search_term),
                Exam.exam_name.ilike(search_term),
                Exam.class_name.ilike(search_term),
                Exam.section.ilike(search_term),
                Exam.subject_name.ilike(search_term),
                Exam.subject_code.ilike(search_term),
            )
        )

    # --------------------------------------------------------
    # FILTERS
    # --------------------------------------------------------

    if academic_year:
        query = query.filter(
            Exam.academic_year == academic_year
        )

    if exam_type:
        query = query.filter(
            Exam.exam_type == exam_type
        )

    if class_name:
        query = query.filter(
            Exam.class_name == class_name
        )

    if section:
        query = query.filter(
            Exam.section == section
        )

    if subject_name:
        query = query.filter(
            Exam.subject_name == subject_name
        )

    if status:
        query = query.filter(
            Exam.status == status
        )

    if is_published is not None:
        query = query.filter(
            Exam.is_published == is_published
        )

    if exam_date:
        query = query.filter(
            Exam.exam_date == exam_date
        )

    # --------------------------------------------------------
    # TOTAL
    # --------------------------------------------------------

    total = query.count()

    total_pages = (
        ceil(total / page_size)
        if total > 0
        else 0
    )

    offset = (page - 1) * page_size

    exams = (
        query
        .order_by(
            Exam.exam_date.asc(),
            Exam.start_time.asc(),
            Exam.id.asc(),
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return ExamListResponse(
        items=exams,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


# ============================================================
# SUMMARY
# ============================================================

@router.get(
    "/summary",
    response_model=ExamSummary,
)
def exam_summary(
    academic_year: str | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Exam)

    if academic_year:
        query = query.filter(
            Exam.academic_year == academic_year
        )

    total_exams = query.count()

    scheduled_exams = (
        query
        .filter(Exam.status == "SCHEDULED")
        .count()
    )

    completed_exams = (
        query
        .filter(Exam.status == "COMPLETED")
        .count()
    )

    cancelled_exams = (
        query
        .filter(Exam.status == "CANCELLED")
        .count()
    )

    published_exams = (
        query
        .filter(Exam.is_published.is_(True))
        .count()
    )

    unpublished_exams = (
        query
        .filter(Exam.is_published.is_(False))
        .count()
    )

    return ExamSummary(
        total_exams=total_exams,
        scheduled_exams=scheduled_exams,
        completed_exams=completed_exams,
        cancelled_exams=cancelled_exams,
        published_exams=published_exams,
        unpublished_exams=unpublished_exams,
    )


# ============================================================
# UPCOMING EXAMS
# ============================================================

@router.get(
    "/upcoming",
    response_model=list[ExamDashboardItem],
)
def upcoming_exams(
    limit: int = Query(
        default=10,
        ge=1,
        le=50,
    ),
    class_name: str | None = Query(
        default=None,
    ),
    academic_year: str | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Exam).filter(
        Exam.exam_date >= date.today(),
        Exam.status != "CANCELLED",
    )

    if class_name:
        query = query.filter(
            Exam.class_name == class_name
        )

    if academic_year:
        query = query.filter(
            Exam.academic_year == academic_year
        )

    return (
        query
        .order_by(
            Exam.exam_date.asc(),
            Exam.start_time.asc(),
        )
        .limit(limit)
        .all()
    )


# ============================================================
# GET SINGLE EXAM
# ============================================================

@router.get(
    "/{exam_id}",
    response_model=ExamResponse,
)
def get_exam(
    exam_id: int,
    db: Session = Depends(get_db),
):
    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found.",
        )

    return exam


# ============================================================
# UPDATE EXAM
# ============================================================

@router.put(
    "/{exam_id}",
    response_model=ExamResponse,
)
def update_exam(
    exam_id: int,
    payload: ExamUpdate,
    db: Session = Depends(get_db),
):
    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found.",
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    new_maximum_marks = update_data.get(
        "maximum_marks",
        exam.maximum_marks,
    )

    new_passing_marks = update_data.get(
        "passing_marks",
        exam.passing_marks,
    )

    validate_marks(
        new_maximum_marks,
        new_passing_marks,
    )

    if "status" in update_data:
        if update_data["status"] not in VALID_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid status. Allowed values: "
                    f"{', '.join(sorted(VALID_STATUSES))}"
                ),
            )

    # Prevent duplicate schedule after update
    check_class = update_data.get(
        "class_name",
        exam.class_name,
    )

    check_section = update_data.get(
        "section",
        exam.section,
    )

    check_subject = update_data.get(
        "subject_name",
        exam.subject_name,
    )

    check_date = update_data.get(
        "exam_date",
        exam.exam_date,
    )

    check_name = update_data.get(
        "exam_name",
        exam.exam_name,
    )

    duplicate = (
        db.query(Exam)
        .filter(
            Exam.id != exam_id,
            Exam.academic_year
            == update_data.get(
                "academic_year",
                exam.academic_year,
            ),
            Exam.class_name == check_class,
            Exam.section == check_section,
            Exam.subject_name == check_subject,
            Exam.exam_date == check_date,
            Exam.exam_name == check_name,
        )
        .first()
    )

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail=(
                "Another exam already exists for this "
                "class, subject, date and exam name."
            ),
        )

    for field, value in update_data.items():
        setattr(exam, field, value)

    db.commit()
    db.refresh(exam)

    return exam


# ============================================================
# UPDATE STATUS
# ============================================================

@router.patch(
    "/{exam_id}/status",
    response_model=ExamResponse,
)
def update_exam_status(
    exam_id: int,
    payload: ExamStatusUpdate,
    db: Session = Depends(get_db),
):
    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found.",
        )

    if payload.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid status. Allowed values: "
                f"{', '.join(sorted(VALID_STATUSES))}"
            ),
        )

    exam.status = payload.status

    db.commit()
    db.refresh(exam)

    return exam


# ============================================================
# PUBLISH / UNPUBLISH
# ============================================================

@router.patch(
    "/{exam_id}/publish",
    response_model=ExamResponse,
)
def publish_exam(
    exam_id: int,
    payload: ExamPublishUpdate,
    db: Session = Depends(get_db),
):
    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found.",
        )

    if payload.is_published and exam.status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Cancelled exams cannot be published.",
        )

    exam.is_published = payload.is_published

    db.commit()
    db.refresh(exam)

    return exam


# ============================================================
# DELETE EXAM
# ============================================================

@router.delete(
    "/{exam_id}",
)
def delete_exam(
    exam_id: int,
    db: Session = Depends(get_db),
):
    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found.",
        )

    if exam.is_published:
        raise HTTPException(
            status_code=400,
            detail="Published exams cannot be deleted. Unpublish the exam first.",
        )

    db.delete(exam)
    db.commit()

    return {
        "message": "Exam deleted successfully.",
        "exam_id": exam_id,
    }