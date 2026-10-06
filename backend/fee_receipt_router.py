from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db
from models.fee_account import FeeAccount
from models.fee_receipt import FeeReceipt
from models.student import Student

from fee_receipt_pdf import generate_fee_receipt_pdf
from fee_receipt_schemas import FeeReceiptResponse


router = APIRouter(
    prefix="/fee-accounts",
    tags=["Fee Receipts"],
)


@router.get(
    "/{fee_account_id}/receipts",
    response_model=list[FeeReceiptResponse],
)
def get_fee_receipts(
    fee_account_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    fee_account = (
        db.query(FeeAccount)
        .filter(
            FeeAccount.id == fee_account_id
        )
        .first()
    )

    if not fee_account:
        raise HTTPException(
            status_code=404,
            detail="Fee account not found.",
        )

    receipts = (
        db.query(FeeReceipt)
        .filter(
            FeeReceipt.fee_account_id
            == fee_account_id
        )
        .order_by(
            FeeReceipt.id.desc()
        )
        .all()
    )

    return receipts


@router.get(
    "/{fee_account_id}/receipts/{receipt_id}",
    response_model=FeeReceiptResponse,
)
def get_fee_receipt(
    fee_account_id: int,
    receipt_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    receipt = (
        db.query(FeeReceipt)
        .filter(
            FeeReceipt.id == receipt_id,
            FeeReceipt.fee_account_id
            == fee_account_id,
        )
        .first()
    )

    if not receipt:
        raise HTTPException(
            status_code=404,
            detail="Fee receipt not found.",
        )

    return receipt


@router.get(
    "/{fee_account_id}/receipts/{receipt_id}/pdf",
    response_class=FileResponse,
    responses={
        200: {
            "content": {
                "application/pdf": {}
            },
            "description": "Fee receipt PDF",
        }
    },
)
def download_fee_receipt_pdf(
    fee_account_id: int,
    receipt_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
        )
    ),
):
    receipt = (
        db.query(FeeReceipt)
        .filter(
            FeeReceipt.id == receipt_id,
            FeeReceipt.fee_account_id
            == fee_account_id,
        )
        .first()
    )

    if not receipt:
        raise HTTPException(
            status_code=404,
            detail="Fee receipt not found.",
        )

    fee_account = (
        db.query(FeeAccount)
        .filter(
            FeeAccount.id == fee_account_id
        )
        .first()
    )

    if not fee_account:
        raise HTTPException(
            status_code=404,
            detail="Fee account not found.",
        )

    student = (
        db.query(Student)
        .filter(
            Student.id == fee_account.student_id
        )
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    output_directory = Path("output")

    output_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_path = (
        output_directory
        / f"fee_receipt_{receipt.receipt_number}.pdf"
    )

    try:
        generate_fee_receipt_pdf(
            receipt=receipt,
            student=student,
            output_path=str(output_path),
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate fee receipt PDF.",
        )

    return FileResponse(
        path=str(output_path),
        media_type="application/pdf",
        filename=output_path.name,
    )