from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from models.staff_performance import StaffPerformance
from models.staff import Staff

from staff_performance_schemas import (
    StaffPerformanceCreate,
    StaffPerformanceUpdate,
    StaffPerformanceResponse,
    StaffPerformanceListResponse,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/staff-performance",
    tags=["Staff Performance"],
)


# ============================================================
# ALLOWED ROLES
# ============================================================

ALLOWED_ROLES = ["OWNER", "ADMIN"]


# ============================================================
# CREATE PERFORMANCE REVIEW
# ============================================================

@router.post(
    "",
    response_model=StaffPerformanceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_staff_performance(
    data: StaffPerformanceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALLOWED_ROLES)),
):
    staff = (
        db.query(Staff)
        .filter(Staff.id == data.staff_id)
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="Staff member not found",
        )

    if data.review_end_date < data.review_start_date:
        raise HTTPException(
            status_code=400,
            detail="Review end date cannot be before review start date",
        )

    existing = (
        db.query(StaffPerformance)
        .filter(
            StaffPerformance.staff_id == data.staff_id,
            StaffPerformance.review_period == data.review_period,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Performance review already exists for this staff member and review period",
        )

    performance = StaffPerformance(
        **data.model_dump()
    )

    db.add(performance)
    db.commit()
    db.refresh(performance)

    return performance


# ============================================================
# LIST PERFORMANCE REVIEWS
# ============================================================

@router.get(
    "",
    response_model=StaffPerformanceListResponse,
)
def list_staff_performance(
    staff_id: int | None = Query(default=None),
    review_period: str | None = Query(default=None),
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALLOWED_ROLES)),
):
    query = db.query(StaffPerformance)

    if staff_id is not None:
        query = query.filter(
            StaffPerformance.staff_id == staff_id
        )

    if review_period:
        query = query.filter(
            StaffPerformance.review_period.ilike(
                f"%{review_period}%"
            )
        )

    if status_filter:
        query = query.filter(
            StaffPerformance.status == status_filter.upper()
        )

    total = query.count()

    items = (
        query
        .order_by(StaffPerformance.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


# ============================================================
# SUMMARY
# ============================================================

@router.get(
    "/summary",
)
def staff_performance_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALLOWED_ROLES)),
):
    total_reviews = (
        db.query(StaffPerformance).count()
    )

    average_score = (
        db.query(
            func.avg(
                StaffPerformance.overall_score
            )
        )
        .scalar()
    )

    excellent_count = (
        db.query(StaffPerformance)
        .filter(
            StaffPerformance.overall_score >= 90
        )
        .count()
    )

    good_count = (
        db.query(StaffPerformance)
        .filter(
            StaffPerformance.overall_score >= 75,
            StaffPerformance.overall_score < 90,
        )
        .count()
    )

    needs_improvement_count = (
        db.query(StaffPerformance)
        .filter(
            StaffPerformance.overall_score < 60
        )
        .count()
    )

    return {
        "total_reviews": total_reviews,
        "average_score": (
            round(float(average_score), 2)
            if average_score is not None
            else 0
        ),
        "excellent_count": excellent_count,
        "good_count": good_count,
        "needs_improvement_count": needs_improvement_count,
    }


# ============================================================
# GET PERFORMANCE REVIEW
# ============================================================

@router.get(
    "/{performance_id}",
    response_model=StaffPerformanceResponse,
)
def get_staff_performance(
    performance_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALLOWED_ROLES)),
):
    performance = (
        db.query(StaffPerformance)
        .filter(
            StaffPerformance.id == performance_id
        )
        .first()
    )

    if not performance:
        raise HTTPException(
            status_code=404,
            detail="Performance review not found",
        )

    return performance


# ============================================================
# UPDATE PERFORMANCE REVIEW
# ============================================================

@router.put(
    "/{performance_id}",
    response_model=StaffPerformanceResponse,
)
def update_staff_performance(
    performance_id: int,
    data: StaffPerformanceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALLOWED_ROLES)),
):
    performance = (
        db.query(StaffPerformance)
        .filter(
            StaffPerformance.id == performance_id
        )
        .first()
    )

    if not performance:
        raise HTTPException(
            status_code=404,
            detail="Performance review not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    start_date = update_data.get(
        "review_start_date",
        performance.review_start_date,
    )

    end_date = update_data.get(
        "review_end_date",
        performance.review_end_date,
    )

    if end_date < start_date:
        raise HTTPException(
            status_code=400,
            detail="Review end date cannot be before review start date",
        )

    for field, value in update_data.items():
        setattr(
            performance,
            field,
            value,
        )

    db.commit()
    db.refresh(performance)

    return performance


# ============================================================
# DELETE PERFORMANCE REVIEW
# ============================================================

@router.delete(
    "/{performance_id}",
)
def delete_staff_performance(
    performance_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALLOWED_ROLES)),
):
    performance = (
        db.query(StaffPerformance)
        .filter(
            StaffPerformance.id == performance_id
        )
        .first()
    )

    if not performance:
        raise HTTPException(
            status_code=404,
            detail="Performance review not found",
        )

    db.delete(performance)
    db.commit()

    return {
        "message": "Performance review deleted successfully",
        "id": performance_id,
    }