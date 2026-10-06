from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from database import get_db

from models.payroll_payslip import PayrollPayslip
from models.staff_payroll import StaffPayroll
from models.staff import Staff

from payroll_payslip_schemas import (
    PayrollPayslipCreate,
    PayrollPayslipUpdate,
    PayrollPayslipResponse,
    PayrollPayslipListItem,
    PayrollPayslipListResponse,
    PayrollPayslipSummary,
    PayslipGenerationResponse,
    PayslipPayment,
    PayrollReportItem,
    PayrollReportResponse,
)

from payroll_payslip_pdf import (
    generate_payroll_payslip_pdf,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/payroll-payslips",
    tags=["Payroll Payslips"],
)


# ============================================================
# HELPERS
# ============================================================

def decimal_value(value):
    if value is None:
        return Decimal("0.00")

    return Decimal(str(value))


def generate_payslip_number(
    db: Session,
    payroll_year: int,
    payroll_month: int,
):
    prefix = (
        f"PAY-{payroll_year}-"
        f"{payroll_month:02d}-"
    )

    last_payslip = (
        db.query(PayrollPayslip)
        .filter(
            PayrollPayslip.payslip_number.like(
                f"{prefix}%"
            )
        )
        .order_by(
            PayrollPayslip.id.desc()
        )
        .first()
    )

    if not last_payslip:
        sequence = 1
    else:
        try:
            last_sequence = int(
                last_payslip.payslip_number.split("-")[-1]
            )
            sequence = last_sequence + 1
        except (ValueError, IndexError):
            sequence = 1

    return f"{prefix}{sequence:04d}"


def get_staff_or_404(
    db: Session,
    staff_id: int,
):
    staff = (
        db.query(Staff)
        .filter(
            Staff.id == staff_id,
            Staff.is_deleted == False,
        )
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="Staff member not found",
        )

    return staff


def get_payslip_or_404(
    db: Session,
    payslip_id: int,
):
    payslip = (
        db.query(PayrollPayslip)
        .filter(
            PayrollPayslip.id == payslip_id
        )
        .first()
    )

    if not payslip:
        raise HTTPException(
            status_code=404,
            detail="Payslip not found",
        )

    return payslip


# ============================================================
# GENERATE PAYSLIP
# ============================================================

@router.post(
    "/generate/{payroll_id}",
    response_model=PayslipGenerationResponse,
)
def generate_payslip(
    payroll_id: int,
    db: Session = Depends(get_db),
):
    payroll = (
        db.query(StaffPayroll)
        .filter(
            StaffPayroll.id == payroll_id
        )
        .first()
    )

    if not payroll:
        raise HTTPException(
            status_code=404,
            detail="Payroll record not found",
        )

    # --------------------------------------------------------
    # PAYROLL MUST BE APPROVED OR PAID
    # --------------------------------------------------------

    if payroll.status not in [
        "APPROVED",
        "PAID",
    ]:
        raise HTTPException(
            status_code=400,
            detail=(
                "Payslip can only be generated "
                "for APPROVED or PAID payroll"
            ),
        )

    # --------------------------------------------------------
    # CHECK DUPLICATE
    # --------------------------------------------------------

    existing = (
        db.query(PayrollPayslip)
        .filter(
            PayrollPayslip.payroll_id
            == payroll.id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail=(
                "Payslip already exists for "
                "this payroll"
            ),
        )

    # --------------------------------------------------------
    # STAFF
    # --------------------------------------------------------

    staff = get_staff_or_404(
        db,
        payroll.staff_id,
    )

    # --------------------------------------------------------
    # PAYSLIP NUMBER
    # --------------------------------------------------------

    payslip_number = generate_payslip_number(
        db,
        payroll.payroll_year,
        payroll.payroll_month,
    )

    # --------------------------------------------------------
    # CREATE SNAPSHOT
    # --------------------------------------------------------

    payslip = PayrollPayslip(
        payroll_id=payroll.id,
        staff_id=payroll.staff_id,
        payslip_number=payslip_number,

        payroll_month=payroll.payroll_month,
        payroll_year=payroll.payroll_year,
        pay_date=payroll.pay_date,

        total_working_days=payroll.total_working_days,
        days_present=payroll.days_present,
        days_absent=payroll.days_absent,
        days_on_leave=payroll.days_on_leave,
        half_days=payroll.half_days,
        loss_of_pay_days=payroll.loss_of_pay_days,

        basic_salary=payroll.basic_salary,
        allowances=payroll.allowances,
        overtime_amount=payroll.overtime_amount,
        bonus_amount=payroll.bonus_amount,
        gross_salary=payroll.gross_salary,

        loss_of_pay_amount=payroll.loss_of_pay_amount,
        other_deductions=payroll.deductions,
        total_deductions=payroll.total_deductions,

        net_salary=payroll.net_salary,

        payment_status=(
            "PAID"
            if payroll.status == "PAID"
            else "PENDING"
        ),

        payment_method=payroll.payment_method,
        payment_reference=payroll.payment_reference,
        payment_date=payroll.payment_date,

        remarks=payroll.remarks,
    )

    db.add(payslip)
    db.commit()
    db.refresh(payslip)

    return {
        "message": "Payslip generated successfully",
        "payslip_id": payslip.id,
        "payslip_number": payslip.payslip_number,
        "payroll_id": payslip.payroll_id,
    }


# ============================================================
# LIST PAYSLIPS
# ============================================================

@router.get(
    "",
    response_model=PayrollPayslipListResponse,
)
def list_payslips(
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),
    month: int | None = Query(
        None,
        ge=1,
        le=12,
    ),
    year: int | None = Query(
        None,
        ge=2000,
        le=2100,
    ),
    payment_status: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            PayrollPayslip,
            Staff,
        )
        .join(
            Staff,
            Staff.id
            == PayrollPayslip.staff_id,
        )
    )

    # --------------------------------------------------------
    # FILTER MONTH
    # --------------------------------------------------------

    if month:
        query = query.filter(
            PayrollPayslip.payroll_month
            == month
        )

    # --------------------------------------------------------
    # FILTER YEAR
    # --------------------------------------------------------

    if year:
        query = query.filter(
            PayrollPayslip.payroll_year
            == year
        )

    # --------------------------------------------------------
    # PAYMENT STATUS
    # --------------------------------------------------------

    if payment_status:
        query = query.filter(
            PayrollPayslip.payment_status
            == payment_status.upper()
        )

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    if search:
        search_term = (
            f"%{search.strip()}%"
        )

        query = query.filter(
            or_(
                PayrollPayslip.payslip_number.ilike(
                    search_term
                ),
                Staff.staff_id.ilike(
                    search_term
                ),
                Staff.first_name.ilike(
                    search_term
                ),
                Staff.last_name.ilike(
                    search_term
                ),
                Staff.department.ilike(
                    search_term
                ),
                Staff.designation.ilike(
                    search_term
                ),
            )
        )

    # --------------------------------------------------------
    # TOTAL
    # --------------------------------------------------------

    total = query.count()

    offset = (
        page - 1
    ) * page_size

    rows = (
        query
        .order_by(
            PayrollPayslip.payroll_year.desc(),
            PayrollPayslip.payroll_month.desc(),
            PayrollPayslip.id.desc(),
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    items = []

    for payslip, staff in rows:

        staff_name = (
            f"{staff.first_name} "
            f"{staff.last_name}"
        ).strip()

        items.append(
            PayrollPayslipListItem(
                id=payslip.id,
                payroll_id=payslip.payroll_id,
                staff_id=payslip.staff_id,
                payslip_number=payslip.payslip_number,

                payroll_month=payslip.payroll_month,
                payroll_year=payslip.payroll_year,
                pay_date=payslip.pay_date,

                staff_code=staff.staff_id,
                staff_name=staff_name,
                department=staff.department,
                designation=staff.designation,

                gross_salary=payslip.gross_salary,
                total_deductions=payslip.total_deductions,
                net_salary=payslip.net_salary,

                payment_status=payslip.payment_status,
                payment_method=payslip.payment_method,
                payment_reference=payslip.payment_reference,
                payment_date=payslip.payment_date,

                created_at=payslip.created_at,
            )
        )

    total_pages = (
        (total + page_size - 1)
        // page_size
    )

    return PayrollPayslipListResponse(
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
    response_model=PayrollPayslipSummary,
)
def payslip_summary(
    month: int | None = Query(
        None,
        ge=1,
        le=12,
    ),
    year: int | None = Query(
        None,
        ge=2000,
        le=2100,
    ),
    db: Session = Depends(get_db),
):
    query = db.query(
        PayrollPayslip
    )

    if month:
        query = query.filter(
            PayrollPayslip.payroll_month
            == month
        )

    if year:
        query = query.filter(
            PayrollPayslip.payroll_year
            == year
        )

    total_payslips = query.count()

    gross_salary = (
        query.with_entities(
            func.coalesce(
                func.sum(
                    PayrollPayslip.gross_salary
                ),
                0,
            )
        )
        .scalar()
    )

    total_deductions = (
        query.with_entities(
            func.coalesce(
                func.sum(
                    PayrollPayslip.total_deductions
                ),
                0,
            )
        )
        .scalar()
    )

    net_salary = (
        query.with_entities(
            func.coalesce(
                func.sum(
                    PayrollPayslip.net_salary
                ),
                0,
            )
        )
        .scalar()
    )

    paid_amount = (
        query.filter(
            PayrollPayslip.payment_status
            == "PAID"
        )
        .with_entities(
            func.coalesce(
                func.sum(
                    PayrollPayslip.net_salary
                ),
                0,
            )
        )
        .scalar()
    )

    pending_amount = (
        query.filter(
            PayrollPayslip.payment_status
            == "PENDING"
        )
        .with_entities(
            func.coalesce(
                func.sum(
                    PayrollPayslip.net_salary
                ),
                0,
            )
        )
        .scalar()
    )

    return PayrollPayslipSummary(
        total_payslips=total_payslips,
        total_gross_salary=gross_salary,
        total_deductions=total_deductions,
        total_net_salary=net_salary,
        paid_amount=paid_amount,
        pending_amount=pending_amount,
    )


# ============================================================
# DOWNLOAD PAYSLIP PDF
# ============================================================

@router.get(
    "/{payslip_id}/pdf"
)
def download_payslip_pdf(
    payslip_id: int,
    db: Session = Depends(get_db),
):
    payslip = get_payslip_or_404(
        db,
        payslip_id,
    )

    staff = (
        db.query(Staff)
        .filter(
            Staff.id
            == payslip.staff_id
        )
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="Staff member not found",
        )

    pdf_buffer = (
        generate_payroll_payslip_pdf(
            payslip=payslip,
            staff=staff,
        )
    )

    filename = (
        f"{payslip.payslip_number}.pdf"
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )


# ============================================================
# GET SINGLE PAYSLIP
# ============================================================

@router.get(
    "/{payslip_id}",
    response_model=PayrollPayslipResponse,
)
def get_payslip(
    payslip_id: int,
    db: Session = Depends(get_db),
):
    payslip = get_payslip_or_404(
        db,
        payslip_id,
    )

    staff = (
        db.query(Staff)
        .filter(
            Staff.id
            == payslip.staff_id
        )
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="Staff member not found",
        )

    return PayrollPayslipResponse(
        id=payslip.id,
        payroll_id=payslip.payroll_id,
        staff_id=payslip.staff_id,
        payslip_number=payslip.payslip_number,

        payroll_month=payslip.payroll_month,
        payroll_year=payslip.payroll_year,
        pay_date=payslip.pay_date,

        total_working_days=payslip.total_working_days,
        days_present=payslip.days_present,
        days_absent=payslip.days_absent,
        days_on_leave=payslip.days_on_leave,
        half_days=payslip.half_days,
        loss_of_pay_days=payslip.loss_of_pay_days,

        basic_salary=payslip.basic_salary,
        allowances=payslip.allowances,
        overtime_amount=payslip.overtime_amount,
        bonus_amount=payslip.bonus_amount,
        gross_salary=payslip.gross_salary,

        loss_of_pay_amount=payslip.loss_of_pay_amount,
        other_deductions=payslip.other_deductions,
        total_deductions=payslip.total_deductions,

        net_salary=payslip.net_salary,

        payment_status=payslip.payment_status,
        payment_method=payslip.payment_method,
        payment_reference=payslip.payment_reference,
        payment_date=payslip.payment_date,

        remarks=payslip.remarks,

        created_at=payslip.created_at,
        updated_at=payslip.updated_at,

        staff_code=staff.staff_id,
        staff_name=(
            f"{staff.first_name} "
            f"{staff.last_name}"
        ).strip(),
        department=staff.department,
        designation=staff.designation,
    )


# ============================================================
# UPDATE PAYSLIP
# ============================================================

@router.put(
    "/{payslip_id}",
    response_model=PayrollPayslipResponse,
)
def update_payslip(
    payslip_id: int,
    payload: PayrollPayslipUpdate,
    db: Session = Depends(get_db),
):
    payslip = get_payslip_or_404(
        db,
        payslip_id,
    )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():

        if hasattr(payslip, field):
            setattr(
                payslip,
                field,
                value,
            )

    db.commit()
    db.refresh(payslip)

    staff = (
        db.query(Staff)
        .filter(
            Staff.id
            == payslip.staff_id
        )
        .first()
    )

    return PayrollPayslipResponse(
        id=payslip.id,
        payroll_id=payslip.payroll_id,
        staff_id=payslip.staff_id,
        payslip_number=payslip.payslip_number,

        payroll_month=payslip.payroll_month,
        payroll_year=payslip.payroll_year,
        pay_date=payslip.pay_date,

        total_working_days=payslip.total_working_days,
        days_present=payslip.days_present,
        days_absent=payslip.days_absent,
        days_on_leave=payslip.days_on_leave,
        half_days=payslip.half_days,
        loss_of_pay_days=payslip.loss_of_pay_days,

        basic_salary=payslip.basic_salary,
        allowances=payslip.allowances,
        overtime_amount=payslip.overtime_amount,
        bonus_amount=payslip.bonus_amount,
        gross_salary=payslip.gross_salary,

        loss_of_pay_amount=payslip.loss_of_pay_amount,
        other_deductions=payslip.other_deductions,
        total_deductions=payslip.total_deductions,

        net_salary=payslip.net_salary,

        payment_status=payslip.payment_status,
        payment_method=payslip.payment_method,
        payment_reference=payslip.payment_reference,
        payment_date=payslip.payment_date,

        remarks=payslip.remarks,

        created_at=payslip.created_at,
        updated_at=payslip.updated_at,

        staff_code=(
            staff.staff_id
            if staff
            else None
        ),
        staff_name=(
            f"{staff.first_name} "
            f"{staff.last_name}"
        ).strip()
        if staff
        else None,
        department=(
            staff.department
            if staff
            else None
        ),
        designation=(
            staff.designation
            if staff
            else None
        ),
    )


# ============================================================
# MARK PAYSLIP AS PAID
# ============================================================

@router.patch(
    "/{payslip_id}/pay",
    response_model=PayrollPayslipResponse,
)
def pay_payslip(
    payslip_id: int,
    payload: PayslipPayment,
    db: Session = Depends(get_db),
):
    payslip = get_payslip_or_404(
        db,
        payslip_id,
    )

    if payslip.payment_status == "PAID":
        raise HTTPException(
            status_code=400,
            detail="Payslip is already marked as PAID",
        )

    payslip.payment_status = "PAID"

    payslip.payment_method = (
        payload.payment_method
    )

    payslip.payment_reference = (
        payload.payment_reference
    )

    payslip.payment_date = (
        payload.payment_date
        or date.today()
    )

    if payload.remarks is not None:
        payslip.remarks = payload.remarks

    db.commit()
    db.refresh(payslip)

    staff = (
        db.query(Staff)
        .filter(
            Staff.id
            == payslip.staff_id
        )
        .first()
    )

    return PayrollPayslipResponse(
        id=payslip.id,
        payroll_id=payslip.payroll_id,
        staff_id=payslip.staff_id,
        payslip_number=payslip.payslip_number,

        payroll_month=payslip.payroll_month,
        payroll_year=payslip.payroll_year,
        pay_date=payslip.pay_date,

        total_working_days=payslip.total_working_days,
        days_present=payslip.days_present,
        days_absent=payslip.days_absent,
        days_on_leave=payslip.days_on_leave,
        half_days=payslip.half_days,
        loss_of_pay_days=payslip.loss_of_pay_days,

        basic_salary=payslip.basic_salary,
        allowances=payslip.allowances,
        overtime_amount=payslip.overtime_amount,
        bonus_amount=payslip.bonus_amount,
        gross_salary=payslip.gross_salary,

        loss_of_pay_amount=payslip.loss_of_pay_amount,
        other_deductions=payslip.other_deductions,
        total_deductions=payslip.total_deductions,

        net_salary=payslip.net_salary,

        payment_status=payslip.payment_status,
        payment_method=payslip.payment_method,
        payment_reference=payslip.payment_reference,
        payment_date=payslip.payment_date,

        remarks=payslip.remarks,

        created_at=payslip.created_at,
        updated_at=payslip.updated_at,

        staff_code=(
            staff.staff_id
            if staff
            else None
        ),
        staff_name=(
            f"{staff.first_name} "
            f"{staff.last_name}"
        ).strip()
        if staff
        else None,
        department=(
            staff.department
            if staff
            else None
        ),
        designation=(
            staff.designation
            if staff
            else None
        ),
    )


# ============================================================
# DELETE PAYSLIP
# ============================================================

@router.delete(
    "/{payslip_id}"
)
def delete_payslip(
    payslip_id: int,
    db: Session = Depends(get_db),
):
    payslip = get_payslip_or_404(
        db,
        payslip_id,
    )

    if payslip.payment_status == "PAID":
        raise HTTPException(
            status_code=400,
            detail=(
                "Paid payslips cannot be deleted"
            ),
        )

    db.delete(payslip)
    db.commit()

    return {
        "message": "Payslip deleted successfully"
    }


# ============================================================
# MONTHLY PAYROLL REPORT
# ============================================================

@router.get(
    "/reports/monthly",
    response_model=PayrollReportResponse,
)
def monthly_payroll_report(
    month: int = Query(
        ...,
        ge=1,
        le=12,
    ),
    year: int = Query(
        ...,
        ge=2000,
        le=2100,
    ),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            PayrollPayslip,
            Staff,
        )
        .join(
            Staff,
            Staff.id
            == PayrollPayslip.staff_id,
        )
        .filter(
            PayrollPayslip.payroll_month
            == month,
            PayrollPayslip.payroll_year
            == year,
        )
        .order_by(
            Staff.first_name.asc()
        )
        .all()
    )

    items = []

    total_working_days = Decimal("0")
    total_present = Decimal("0")
    total_absent = Decimal("0")
    total_leave = Decimal("0")
    total_gross = Decimal("0")
    total_deductions = Decimal("0")
    total_net = Decimal("0")
    total_paid = Decimal("0")
    total_pending = Decimal("0")

    for payslip, staff in rows:

        staff_name = (
            f"{staff.first_name} "
            f"{staff.last_name}"
        ).strip()

        item = PayrollReportItem(
            payslip_id=payslip.id,
            payroll_id=payslip.payroll_id,
            staff_id=payslip.staff_id,
            payslip_number=payslip.payslip_number,

            staff_code=staff.staff_id,
            staff_name=staff_name,
            department=staff.department,
            designation=staff.designation,

            total_working_days=payslip.total_working_days,
            days_present=payslip.days_present,
            days_absent=payslip.days_absent,
            days_on_leave=payslip.days_on_leave,

            basic_salary=payslip.basic_salary,
            allowances=payslip.allowances,
            overtime_amount=payslip.overtime_amount,
            bonus_amount=payslip.bonus_amount,

            gross_salary=payslip.gross_salary,
            total_deductions=payslip.total_deductions,
            net_salary=payslip.net_salary,

            payment_status=payslip.payment_status,
        )

        items.append(item)

        total_working_days += decimal_value(
            payslip.total_working_days
        )

        total_present += decimal_value(
            payslip.days_present
        )

        total_absent += decimal_value(
            payslip.days_absent
        )

        total_leave += decimal_value(
            payslip.days_on_leave
        )

        total_gross += decimal_value(
            payslip.gross_salary
        )

        total_deductions += decimal_value(
            payslip.total_deductions
        )

        total_net += decimal_value(
            payslip.net_salary
        )

        if payslip.payment_status == "PAID":
            total_paid += decimal_value(
                payslip.net_salary
            )
        else:
            total_pending += decimal_value(
                payslip.net_salary
            )

    return PayrollReportResponse(
        month=month,
        year=year,

        total_payslips=len(items),

        total_working_days=total_working_days,
        total_present_days=total_present,
        total_absent_days=total_absent,
        total_leave_days=total_leave,

        total_gross_salary=total_gross,
        total_deductions=total_deductions,
        total_net_salary=total_net,

        total_paid_amount=total_paid,
        total_pending_amount=total_pending,

        items=items,
    )