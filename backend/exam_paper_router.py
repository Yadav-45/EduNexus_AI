from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from database import get_db

from models.exam_paper import ExamPaper
from models.exam import Exam

from exam_paper_schemas import (
    ExamPaperCreate,
    ExamPaperUpdate,
    ExamPaperResponse,
    ExamPaperListItem,
    ExamPaperListResponse,
    ExamPaperSummary,
    ExamPaperStatusUpdate,
    ExamPaperPublishUpdate,
    ExamPaperMessage,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/exam-papers",
    tags=["Exam Papers"],
)


# ============================================================
# VALID STATUSES
# ============================================================

VALID_STATUSES = {
    "SCHEDULED",
    "ONGOING",
    "COMPLETED",
    "CANCELLED",
}


# ============================================================
# HELPERS
# ============================================================

def validate_status(status: str):
    status = status.upper()

    if status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. Allowed values: "
                "SCHEDULED, ONGOING, COMPLETED, CANCELLED"
            ),
        )

    return status


def validate_marks(
    maximum_marks,
    passing_marks,
):
    if passing_marks > maximum_marks:
        raise HTTPException(
            status_code=400,
            detail="Passing marks cannot be greater than maximum marks.",
        )


def get_exam_or_404(
    db: Session,
    exam_id: int,
):
    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Examination not found.",
        )

    return exam


# ============================================================
# CREATE
# ============================================================

@router.post(
    "",
    response_model=ExamPaperResponse,
)
def create_exam_paper(
    payload: ExamPaperCreate,
    db: Session = Depends(get_db),
):
    get_exam_or_404(
        db,
        payload.exam_id,
    )

    paper_status = validate_status(
        payload.status
    )

    validate_marks(
        payload.maximum_marks,
        payload.passing_marks,
    )

    existing = (
        db.query(ExamPaper)
        .filter(
            ExamPaper.exam_id == payload.exam_id,
            func.lower(
                ExamPaper.subject_name
            )
            == payload.subject_name.lower(),
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail=(
                "A paper for this subject "
                "already exists under this examination."
            ),
        )

    if (
        payload.start_time
        and payload.end_time
        and payload.end_time <= payload.start_time
    ):
        raise HTTPException(
            status_code=400,
            detail="End time must be later than start time.",
        )

    paper = ExamPaper(
        exam_id=payload.exam_id,
        paper_name=payload.paper_name,
        subject_name=payload.subject_name,
        subject_code=payload.subject_code,
        class_name=payload.class_name,
        section=payload.section,
        exam_date=payload.exam_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        duration_minutes=payload.duration_minutes,
        room_number=payload.room_number,
        maximum_marks=payload.maximum_marks,
        passing_marks=payload.passing_marks,
        status=paper_status,
        is_published=payload.is_published,
        instructions=payload.instructions,
        remarks=payload.remarks,
    )

    db.add(paper)
    db.commit()
    db.refresh(paper)

    return paper


# ============================================================
# LIST
# ============================================================

@router.get(
    "",
    response_model=ExamPaperListResponse,
)
def list_exam_papers(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str = Query(""),
    exam_id: int | None = Query(default=None),
    status: str | None = Query(default=None),
    class_name: str | None = Query(default=None),
    subject_name: str | None = Query(default=None),
    academic_year: str | None = Query(default=None),
    published: bool | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            ExamPaper,
            Exam.exam_name,
            Exam.academic_year,
        )
        .join(
            Exam,
            Exam.id == ExamPaper.exam_id,
        )
    )

    if exam_id is not None:
        query = query.filter(
            ExamPaper.exam_id == exam_id
        )

    if status:
        query = query.filter(
            ExamPaper.status == status.upper()
        )

    if class_name:
        query = query.filter(
            ExamPaper.class_name == class_name
        )

    if subject_name:
        query = query.filter(
            ExamPaper.subject_name == subject_name
        )

    if academic_year:
        query = query.filter(
            Exam.academic_year == academic_year
        )

    if published is not None:
        query = query.filter(
            ExamPaper.is_published == published
        )

    if search.strip():
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                ExamPaper.paper_name.ilike(
                    search_value
                ),
                ExamPaper.subject_name.ilike(
                    search_value
                ),
                ExamPaper.subject_code.ilike(
                    search_value
                ),
                ExamPaper.class_name.ilike(
                    search_value
                ),
                ExamPaper.section.ilike(
                    search_value
                ),
                Exam.exam_name.ilike(
                    search_value
                ),
            )
        )

    total = query.count()

    total_pages = (
        (total + page_size - 1) // page_size
        if total
        else 0
    )

    offset = (page - 1) * page_size

    rows = (
        query
        .order_by(
            ExamPaper.exam_date.asc(),
            ExamPaper.start_time.asc(),
            ExamPaper.id.desc(),
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    items = []

    for paper, exam_name, academic_year_value in rows:
        items.append(
            ExamPaperListItem(
                id=paper.id,
                exam_id=paper.exam_id,
                paper_name=paper.paper_name,
                subject_name=paper.subject_name,
                subject_code=paper.subject_code,
                class_name=paper.class_name,
                section=paper.section,
                exam_date=paper.exam_date,
                start_time=paper.start_time,
                end_time=paper.end_time,
                duration_minutes=paper.duration_minutes,
                room_number=paper.room_number,
                maximum_marks=paper.maximum_marks,
                passing_marks=paper.passing_marks,
                status=paper.status,
                is_published=paper.is_published,
                exam_name=exam_name,
                academic_year=academic_year_value,
                created_at=paper.created_at,
            )
        )

    return ExamPaperListResponse(
        items=items,
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
    response_model=ExamPaperSummary,
)
def exam_paper_summary(
    exam_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(ExamPaper)

    if exam_id is not None:
        query = query.filter(
            ExamPaper.exam_id == exam_id
        )

    total = query.count()

    scheduled = query.filter(
        ExamPaper.status == "SCHEDULED"
    ).count()

    ongoing = query.filter(
        ExamPaper.status == "ONGOING"
    ).count()

    completed = query.filter(
        ExamPaper.status == "COMPLETED"
    ).count()

    cancelled = query.filter(
        ExamPaper.status == "CANCELLED"
    ).count()

    published = query.filter(
        ExamPaper.is_published == True
    ).count()

    unpublished = query.filter(
        ExamPaper.is_published == False
    ).count()

    return ExamPaperSummary(
        total_papers=total,
        scheduled=scheduled,
        ongoing=ongoing,
        completed=completed,
        cancelled=cancelled,
        published=published,
        unpublished=unpublished,
    )


# ============================================================
# GET SINGLE PAPER
# ============================================================

@router.get(
    "/{paper_id}",
    response_model=ExamPaperResponse,
)
def get_exam_paper(
    paper_id: int,
    db: Session = Depends(get_db),
):
    paper = (
        db.query(ExamPaper)
        .filter(
            ExamPaper.id == paper_id
        )
        .first()
    )

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Exam paper not found.",
        )

    return paper


# ============================================================
# UPDATE
# ============================================================

@router.put(
    "/{paper_id}",
    response_model=ExamPaperResponse,
)
def update_exam_paper(
    paper_id: int,
    payload: ExamPaperUpdate,
    db: Session = Depends(get_db),
):
    paper = (
        db.query(ExamPaper)
        .filter(
            ExamPaper.id == paper_id
        )
        .first()
    )

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Exam paper not found.",
        )

    data = payload.model_dump(
        exclude_unset=True
    )

    if "status" in data:
        data["status"] = validate_status(
            data["status"]
        )

    maximum_marks = data.get(
        "maximum_marks",
        paper.maximum_marks,
    )

    passing_marks = data.get(
        "passing_marks",
        paper.passing_marks,
    )

    validate_marks(
        maximum_marks,
        passing_marks,
    )

    start_time = data.get(
        "start_time",
        paper.start_time,
    )

    end_time = data.get(
        "end_time",
        paper.end_time,
    )

    if (
        start_time
        and end_time
        and end_time <= start_time
    ):
        raise HTTPException(
            status_code=400,
            detail="End time must be later than start time.",
        )

    if "subject_name" in data:
        existing = (
            db.query(ExamPaper)
            .filter(
                ExamPaper.exam_id == paper.exam_id,
                ExamPaper.id != paper.id,
                func.lower(
                    ExamPaper.subject_name
                )
                == data["subject_name"].lower(),
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Another paper for this "
                    "subject already exists."
                ),
            )

    for field, value in data.items():
        setattr(
            paper,
            field,
            value,
        )

    db.commit()
    db.refresh(paper)

    return paper


# ============================================================
# STATUS
# ============================================================

@router.patch(
    "/{paper_id}/status",
    response_model=ExamPaperResponse,
)
def update_exam_paper_status(
    paper_id: int,
    payload: ExamPaperStatusUpdate,
    db: Session = Depends(get_db),
):
    paper = (
        db.query(ExamPaper)
        .filter(
            ExamPaper.id == paper_id
        )
        .first()
    )

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Exam paper not found.",
        )

    paper.status = validate_status(
        payload.status
    )

    db.commit()
    db.refresh(paper)

    return paper


# ============================================================
# PUBLISH / UNPUBLISH
# ============================================================

@router.patch(
    "/{paper_id}/publish",
    response_model=ExamPaperResponse,
)
def publish_exam_paper(
    paper_id: int,
    payload: ExamPaperPublishUpdate,
    db: Session = Depends(get_db),
):
    paper = (
        db.query(ExamPaper)
        .filter(
            ExamPaper.id == paper_id
        )
        .first()
    )

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Exam paper not found.",
        )

    if (
        payload.is_published
        and paper.status == "CANCELLED"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "A cancelled exam paper "
                "cannot be published."
            ),
        )

    paper.is_published = payload.is_published

    db.commit()
    db.refresh(paper)

    return paper


# ============================================================
# DELETE
# ============================================================

@router.delete(
    "/{paper_id}",
    response_model=ExamPaperMessage,
)
def delete_exam_paper(
    paper_id: int,
    db: Session = Depends(get_db),
):
    paper = (
        db.query(ExamPaper)
        .filter(
            ExamPaper.id == paper_id
        )
        .first()
    )

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Exam paper not found.",
        )

    db.delete(paper)
    db.commit()

    return ExamPaperMessage(
        message="Exam paper deleted successfully."
    )

