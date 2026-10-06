from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db

from student_fee_statement_schemas import (
    StudentFeeStatementResponse,
)

from student_fee_statement_service import (
    get_student_fee_statement,
)


router = APIRouter(
    prefix="/students",
    tags=["Student Fee Statement"],
)


@router.get(
    "/{student_id}/fee-statement",
    response_model=StudentFeeStatementResponse,
)
def get_fee_statement(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    try:
        return get_student_fee_statement(
            db=db,
            student_id=student_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )