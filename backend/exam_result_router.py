from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy import (
    or_,
    func,
)
from sqlalchemy.orm import Session

from database import get_db

from models.exam_result import ExamResult
from models.exam import Exam
from models.exam_paper import ExamPaper
from models.student import Student

from exam_result_schemas import (
    ExamResultCreate,
    ExamResultUpdate,
    ExamResultResponse,
    ExamResultListItem,
    ExamResultListResponse,
    ExamResultSummary,
    ExamResultPublishUpdate,
    ExamResultMessage,
)


router = APIRouter(
    prefix="/exam-results",
    tags=["Exam Results"],
)


# ============================================================
# HELPERS
# ============================================================

def calculate_percentage(
    marks,
    maximum,
):
    if marks is None:
        return None

    if maximum is None or maximum <= 0:
        return Decimal("0")

    percentage = (
        Decimal(str(marks))
        / Decimal(str(maximum))
    ) * Decimal("100")

    return percentage.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def calculate_result_status(
    marks,
    passing,
    is_absent,
):
    if is_absent:
        return "ABSENT"

    if marks is None:
        return "PENDING"

    if marks >= passing:
        return "PASSED"

    return "FAILED"


def validate_marks(
    marks,
    maximum,
    passing,
):
    if maximum is None or maximum < 0:
        raise HTTPException(
            status_code=400,
            detail="Maximum marks must be zero or greater.",
        )

    if passing is None or passing < 0:
        raise HTTPException(
            status_code=400,
            detail="Passing marks must be zero or greater.",
        )

    if passing > maximum:
        raise HTTPException(
            status_code=400,
            detail=(
                "Passing marks cannot be greater "
                "than maximum marks."
            ),
        )

    if marks is not None and marks > maximum:
        raise HTTPException(
            status_code=400,
            detail=(
                "Marks obtained cannot be greater "
                "than maximum marks."
            ),
        )

    if marks is not None and marks < 0:
        raise HTTPException(
            status_code=400,
            detail="Marks obtained cannot be negative.",
        )


def get_exam_or_404(
    db: Session,
    exam_id: int,
):
    exam = (
        db.query(Exam)
        .filter(
            Exam.id == exam_id
        )
        .first()
    )

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Examination not found.",
        )

    return exam


def get_paper_or_404(
    db: Session,
    paper_id: int,
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


def get_student_or_404(
    db: Session,
    student_id: int,
):
    student = (
        db.query(Student)
        .filter(
            Student.id == student_id
        )
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    return student


def get_student_code(student):
    return (
        getattr(student, "student_id", None)
        or getattr(student, "admission_number", None)
        or getattr(student, "roll_number", None)
    )


def get_student_name(student):
    full_name = getattr(
        student,
        "full_name",
        None,
    )

    if full_name:
        return full_name

    first_name = (
        getattr(
            student,
            "first_name",
            None,
        )
        or ""
    )

    last_name = (
        getattr(
            student,
            "last_name",
            None,
        )
        or ""
    )

    name = (
        f"{first_name} {last_name}"
        .strip()
    )

    return name or "Student"


# ============================================================
# CREATE RESULT
# ============================================================

@router.post(
    "",
    response_model=ExamResultResponse,
)
def create_exam_result(
    payload: ExamResultCreate,
    db: Session = Depends(get_db),
):
    exam = get_exam_or_404(
        db,
        payload.exam_id,
    )

    paper = get_paper_or_404(
        db,
        payload.exam_paper_id,
    )

    student = get_student_or_404(
        db,
        payload.student_id,
    )

    if paper.exam_id != exam.id:
        raise HTTPException(
            status_code=400,
            detail=(
                "The selected exam paper "
                "does not belong to the selected examination."
            ),
        )

    validate_marks(
        payload.marks_obtained,
        payload.maximum_marks,
        payload.passing_marks,
    )

    existing = (
        db.query(ExamResult)
        .filter(
            ExamResult.exam_paper_id
            == payload.exam_paper_id,
            ExamResult.student_id
            == payload.student_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail=(
                "A result already exists for "
                "this student and exam paper."
            ),
        )

    maximum_marks = (
        payload.maximum_marks
    )

    passing_marks = (
        payload.passing_marks
    )

    # Use the paper's marks when available.
    if maximum_marks == Decimal("100"):
        maximum_marks = (
            paper.maximum_marks
        )

    if passing_marks == Decimal("33"):
        passing_marks = (
            paper.passing_marks
        )

    validate_marks(
        payload.marks_obtained,
        maximum_marks,
        passing_marks,
    )

    marks = (
        None
        if payload.is_absent
        else payload.marks_obtained
    )

    percentage = calculate_percentage(
        marks,
        maximum_marks,
    )

    result_status = (
        calculate_result_status(
            marks,
            passing_marks,
            payload.is_absent,
        )
    )

    result = ExamResult(
        exam_id=exam.id,
        exam_paper_id=paper.id,
        student_id=student.id,
        marks_obtained=marks,
        maximum_marks=maximum_marks,
        passing_marks=passing_marks,
        percentage=percentage,
        result_status=result_status,
        is_absent=payload.is_absent,
        is_published=payload.is_published,
        remarks=payload.remarks,
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    return result


# ============================================================
# LIST RESULTS
# ============================================================

@router.get(
    "",
    response_model=ExamResultListResponse,
)
def list_exam_results(
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    search: str = Query(
        "",
    ),
    exam_id: int | None = Query(
        default=None,
    ),
    exam_paper_id: int | None = Query(
        default=None,
    ),
    student_id: int | None = Query(
        default=None,
    ),
    class_name: str | None = Query(
        default=None,
    ),
    result_status: str | None = Query(
        default=None,
    ),
    published: bool | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            ExamResult,
            Exam.exam_name,
            Exam.academic_year,
            ExamPaper.paper_name,
            ExamPaper.subject_name,
            ExamPaper.subject_code,
            Student,
        )
        .join(
            Exam,
            Exam.id
            == ExamResult.exam_id,
        )
        .join(
            ExamPaper,
            ExamPaper.id
            == ExamResult.exam_paper_id,
        )
        .join(
            Student,
            Student.id
            == ExamResult.student_id,
        )
    )

    if exam_id is not None:
        query = query.filter(
            ExamResult.exam_id
            == exam_id
        )

    if exam_paper_id is not None:
        query = query.filter(
            ExamResult.exam_paper_id
            == exam_paper_id
        )

    if student_id is not None:
        query = query.filter(
            ExamResult.student_id
            == student_id
        )

    if class_name:
        query = query.filter(
            Student.class_name
            == class_name
        )

    if result_status:
        query = query.filter(
            ExamResult.result_status
            == result_status.upper()
        )

    if published is not None:
        query = query.filter(
            ExamResult.is_published
            == published
        )

    if search.strip():
        search_value = (
            f"%{search.strip()}%"
        )

        search_conditions = [
            Exam.exam_name.ilike(
                search_value
            ),
            ExamPaper.paper_name.ilike(
                search_value
            ),
            ExamPaper.subject_name.ilike(
                search_value
            ),
            ExamPaper.subject_code.ilike(
                search_value
            ),
        ]

        if hasattr(
            Student,
            "student_id",
        ):
            search_conditions.append(
                Student.student_id.ilike(
                    search_value
                )
            )

        if hasattr(
            Student,
            "first_name",
        ):
            search_conditions.append(
                Student.first_name.ilike(
                    search_value
                )
            )

        if hasattr(
            Student,
            "last_name",
        ):
            search_conditions.append(
                Student.last_name.ilike(
                    search_value
                )
            )

        query = query.filter(
            or_(
                *search_conditions
            )
        )

    total = query.count()

    total_pages = (
        (total + page_size - 1)
        // page_size
        if total
        else 0
    )

    offset = (
        page - 1
    ) * page_size

    rows = (
        query
        .order_by(
            ExamResult.id.desc()
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    items = []

    for (
        result,
        exam_name,
        academic_year,
        paper_name,
        subject_name,
        subject_code,
        student,
    ) in rows:

        items.append(
            ExamResultListItem(
                id=result.id,
                exam_id=result.exam_id,
                exam_paper_id=result.exam_paper_id,
                student_id=result.student_id,

                student_code=get_student_code(
                    student
                ),

                student_name=get_student_name(
                    student
                ),

                class_name=getattr(
                    student,
                    "class_name",
                    None,
                ),

                section=getattr(
                    student,
                    "section",
                    None,
                ),

                exam_name=exam_name,
                academic_year=academic_year,

                paper_name=paper_name,
                subject_name=subject_name,
                subject_code=subject_code,

                marks_obtained=result.marks_obtained,
                maximum_marks=result.maximum_marks,
                passing_marks=result.passing_marks,

                percentage=result.percentage,

                result_status=result.result_status,

                is_absent=result.is_absent,
                is_published=result.is_published,

                remarks=result.remarks,

                created_at=result.created_at,
            )
        )

    return ExamResultListResponse(
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
    response_model=ExamResultSummary,
)
def exam_result_summary(
    exam_id: int | None = Query(
        default=None,
    ),
    exam_paper_id: int | None = Query(
        default=None,
    ),
    class_name: str | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
):
    query = (
        db.query(ExamResult)
        .join(
            Student,
            Student.id
            == ExamResult.student_id,
        )
    )

    if exam_id is not None:
        query = query.filter(
            ExamResult.exam_id
            == exam_id
        )

    if exam_paper_id is not None:
        query = query.filter(
            ExamResult.exam_paper_id
            == exam_paper_id
        )

    if class_name:
        query = query.filter(
            Student.class_name
            == class_name
        )

    total = query.count()

    passed = (
        query.filter(
            ExamResult.result_status
            == "PASSED"
        ).count()
    )

    failed = (
        query.filter(
            ExamResult.result_status
            == "FAILED"
        ).count()
    )

    absent = (
        query.filter(
            ExamResult.result_status
            == "ABSENT"
        ).count()
    )

    pending = (
        query.filter(
            ExamResult.result_status
            == "PENDING"
        ).count()
    )

    published = (
        query.filter(
            ExamResult.is_published
            == True
        ).count()
    )

    unpublished = (
        query.filter(
            ExamResult.is_published
            == False
        ).count()
    )

    average_marks = (
        query.with_entities(
            func.avg(
                ExamResult.marks_obtained
            )
        )
        .scalar()
        or Decimal("0")
    )

    highest_marks = (
        query.with_entities(
            func.max(
                ExamResult.marks_obtained
            )
        )
        .scalar()
        or Decimal("0")
    )

    average_percentage = (
        query.with_entities(
            func.avg(
                ExamResult.percentage
            )
        )
        .scalar()
        or Decimal("0")
    )

    return ExamResultSummary(
        total_results=total,
        passed=passed,
        failed=failed,
        absent=absent,
        pending=pending,
        published=published,
        unpublished=unpublished,
        average_marks=average_marks,
        highest_marks=highest_marks,
        average_percentage=average_percentage,
    )


# ============================================================
# GET SINGLE RESULT
# ============================================================

@router.get(
    "/{result_id}",
    response_model=ExamResultResponse,
)
def get_exam_result(
    result_id: int,
    db: Session = Depends(get_db),
):
    result = (
        db.query(ExamResult)
        .filter(
            ExamResult.id == result_id
        )
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Exam result not found.",
        )

    return result


# ============================================================
# UPDATE RESULT
# ============================================================

@router.put(
    "/{result_id}",
    response_model=ExamResultResponse,
)
def update_exam_result(
    result_id: int,
    payload: ExamResultUpdate,
    db: Session = Depends(get_db),
):
    result = (
        db.query(ExamResult)
        .filter(
            ExamResult.id == result_id
        )
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Exam result not found.",
        )

    data = payload.model_dump(
        exclude_unset=True
    )

    maximum_marks = data.get(
        "maximum_marks",
        result.maximum_marks,
    )

    passing_marks = data.get(
        "passing_marks",
        result.passing_marks,
    )

    is_absent = data.get(
        "is_absent",
        result.is_absent,
    )

    marks = data.get(
        "marks_obtained",
        result.marks_obtained,
    )

    if is_absent:
        marks = None

    validate_marks(
        marks,
        maximum_marks,
        passing_marks,
    )

    result.maximum_marks = (
        maximum_marks
    )

    result.passing_marks = (
        passing_marks
    )

    result.marks_obtained = marks

    result.is_absent = is_absent

    if "is_published" in data:
        result.is_published = (
            data["is_published"]
        )

    if "remarks" in data:
        result.remarks = (
            data["remarks"]
        )

    result.percentage = (
        calculate_percentage(
            marks,
            maximum_marks,
        )
    )

    result.result_status = (
        calculate_result_status(
            marks,
            passing_marks,
            is_absent,
        )
    )

    result.updated_at = (
        datetime.utcnow()
    )

    db.commit()
    db.refresh(result)

    return result


# ============================================================
# PUBLISH / UNPUBLISH
# ============================================================

@router.patch(
    "/{result_id}/publish",
    response_model=ExamResultResponse,
)
def publish_exam_result(
    result_id: int,
    payload: ExamResultPublishUpdate,
    db: Session = Depends(get_db),
):
    result = (
        db.query(ExamResult)
        .filter(
            ExamResult.id == result_id
        )
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Exam result not found.",
        )

    if (
        payload.is_published
        and result.result_status
        == "PENDING"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "A pending result cannot "
                "be published."
            ),
        )

    result.is_published = (
        payload.is_published
    )

    db.commit()
    db.refresh(result)

    return result


# ============================================================
# DELETE
# ============================================================

@router.delete(
    "/{result_id}",
    response_model=ExamResultMessage,
)
def delete_exam_result(
    result_id: int,
    db: Session = Depends(get_db),
):
    result = (
        db.query(ExamResult)
        .filter(
            ExamResult.id == result_id
        )
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Exam result not found.",
        )

    db.delete(result)
    db.commit()

    return ExamResultMessage(
        message="Exam result deleted successfully."
    )