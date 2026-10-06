from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.admission import Admission
from auth.dependencies import require_roles

from enrollment_service import enroll_admission
from enrollment_schemas import EnrollmentResponse


router = APIRouter(
    prefix="/admissions",
    tags=["Enrollment"],
)


@router.post(
    "/{admission_id}/enroll",
    response_model=EnrollmentResponse,
)
def enroll_student(
    admission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("OWNER", "ADMIN")
    ),
):
    admission = (
        db.query(Admission)
        .filter(
            Admission.id == admission_id
        )
        .first()
    )

    if not admission:
        raise HTTPException(
            status_code=404,
            detail="Admission not found",
        )

    try:
        result = enroll_admission(
            db,
            admission,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                "Enrollment failed. "
                "All changes were rolled back."
            ),
        )

    return result