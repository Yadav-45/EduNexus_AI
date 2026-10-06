from datetime import date, datetime
from decimal import Decimal, ROUND_HALF_UP
from math import ceil
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database import get_db

from models.staff import Staff
from models.staff_payroll import StaffPayroll
from models.staff_attendance import StaffAttendance

from staff_payroll_schemas import (
    StaffPayrollCreate,
    StaffPayrollUpdate,
    StaffPayrollResponse,
    StaffPayrollListItem,
    StaffPayrollListResponse,
    StaffPayrollSummary,
    StaffPayrollApproval,
    StaffPayrollPayment,
)


# =====================================================
# ROUTER
# =====================================================

router = APIRouter(
    prefix="/staff-payroll",
    tags=["Staff Payroll"],
)


# =====================================================
# CONSTANTS
# =====================================================

ALLOWED_ROLES = [
    "OWNER",
    "ADMIN",
]

ALLOWED_STATUSES = [
    "DRAFT",
    "PROCESSED",
    "APPROVED",
    "PAID",
    "CANCELLED",
]


# =====================================================
# AUTH HELPER
# =====================================================

def require_owner_admin(
    current_user=Depends(
        lambda: None
    ),
):
    """
    Placeholder dependency.

    The actual project authentication dependency
    should be connected here if the existing project
    exposes one centrally.
    """

    return current_user


# =====================================================
# UTILITY FUNCTIONS
# =====================================================

def money(value) -> Decimal:
    """
    Convert a value into a 2-decimal Decimal.
    """

    return Decimal(str(value or 0)).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def calculate_gross_salary(
    basic_salary: Decimal,
    allowances: Decimal,
    overtime_amount: Decimal,
    bonus_amount: Decimal,
) -> Decimal:

    return money(
        basic_salary
        + allowances
        + overtime_amount
        + bonus_amount
    )


def calculate_total_deductions(
    deductions: Decimal,
    loss_of_pay_amount: Decimal,
) -> Decimal:

    return money(
        deductions
        + loss_of_pay_amount
    )


def calculate_net_salary(
    gross_salary: Decimal,
    total_deductions: Decimal,
) -> Decimal:

    return money(
        gross_salary
        - total_deductions
    )


def calculate_lop_amount(
    basic_salary: Decimal,
    total_working_days: Decimal,
    loss_of_pay_days: Decimal,
) -> Decimal:

    if total_working_days <= 0:
        return Decimal("0.00")

    per_day_salary = (
        basic_salary
        / total_working_days
    )

    return money(
        per_day_salary
        * loss_of_pay_days
    )


# =====================================================
# ATTENDANCE CALCULATION
# =====================================================

def get_attendance_summary(
    db: Session,
    staff_id: int,
    payroll_month: int,
    payroll_year: int,
):

    start_date = date(
        payroll_year,
        payroll_month,
        1,
    )

    if payroll_month == 12:
        end_date = date(
            payroll_year + 1,
            1,
            1,
        )
    else:
        end_date = date(
            payroll_year,
            payroll_month + 1,
            1,
        )

    records = (
        db.query(StaffAttendance)
        .filter(
            StaffAttendance.staff_id == staff_id,
            StaffAttendance.attendance_date >= start_date,
            StaffAttendance.attendance_date < end_date,
        )
        .all()
    )

    present = Decimal("0")
    absent = Decimal("0")
    leave = Decimal("0")
    half_day = Decimal("0")

    for record in records:

        status = (
            record.status or ""
        ).upper()

        if status == "PRESENT":
            present += Decimal("1")

        elif status == "ABSENT":
            absent += Decimal("1")

        elif status == "ON_LEAVE":
            leave += Decimal("1")

        elif status == "HALF_DAY":
            half_day += Decimal("1")

        elif status == "LATE":
            present += Decimal("1")

    return {
        "days_present": present,
        "days_absent": absent,
        "days_on_leave": leave,
        "half_days": half_day,
    }


# =====================================================
# GET STAFF
# =====================================================

def get_active_staff(
    db: Session,
    staff_id: int,
):

    staff = (
        db.query(Staff)
        .filter(
            Staff.id == staff_id,
            Staff.is_deleted == False,
            Staff.status == "ACTIVE",
        )
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="Active staff member not found.",
        )

    return staff


# =====================================================
# GET PAYROLL
# =====================================================

@router.get(
    "",
    response_model=StaffPayrollListResponse,
)
def list_payroll(
    page: int = Query(
        1,
        ge=1,
    ),

    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),

    search: Optional[str] = None,

    status: Optional[str] = None,

    payroll_month: Optional[int] = Query(
        None,
        ge=1,
        le=12,
    ),

    payroll_year: Optional[int] = Query(
        None,
        ge=2000,
        le=2100,
    ),

    db: Session = Depends(get_db),
):

    query = (
        db.query(
            StaffPayroll,
            Staff,
        )
        .join(
            Staff,
            Staff.id == StaffPayroll.staff_id,
        )
        .filter(
            Staff.is_deleted == False,
        )
    )

    if search:

        search_text = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Staff.staff_id.ilike(
                    search_text
                ),

                Staff.first_name.ilike(
                    search_text
                ),

                Staff.last_name.ilike(
                    search_text
                ),

                Staff.department.ilike(
                    search_text
                ),

                Staff.designation.ilike(
                    search_text
                ),
            )
        )

    if status:

        query = query.filter(
            StaffPayroll.status
            == status.upper()
        )

    if payroll_month:

        query = query.filter(
            StaffPayroll.payroll_month
            == payroll_month
        )

    if payroll_year:

        query = query.filter(
            StaffPayroll.payroll_year
            == payroll_year
        )

    total = query.count()

    pages = ceil(
        total / page_size
    ) if total else 0

    offset = (
        page - 1
    ) * page_size

    rows = (
        query
        .order_by(
            StaffPayroll.payroll_year.desc(),
            StaffPayroll.payroll_month.desc(),
            Staff.first_name.asc(),
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    items = []

    for payroll, staff in rows:

        staff_name = (
            f"{staff.first_name or ''} "
            f"{staff.last_name or ''}"
        ).strip()

        items.append(
            StaffPayrollListItem(
                id=payroll.id,
                staff_id=payroll.staff_id,
                payroll_month=payroll.payroll_month,
                payroll_year=payroll.payroll_year,
                pay_date=payroll.pay_date,
                basic_salary=payroll.basic_salary,
                allowances=payroll.allowances,
                deductions=payroll.deductions,
                loss_of_pay_amount=payroll.loss_of_pay_amount,
                overtime_amount=payroll.overtime_amount,
                bonus_amount=payroll.bonus_amount,
                gross_salary=payroll.gross_salary,
                total_deductions=payroll.total_deductions,
                net_salary=payroll.net_salary,
                status=payroll.status,
                payment_method=payroll.payment_method,
                payment_reference=payroll.payment_reference,
                payment_date=payroll.payment_date,
                remarks=payroll.remarks,
                created_at=payroll.created_at,
                updated_at=payroll.updated_at,
                staff_code=staff.staff_id,
                staff_name=staff_name,
                department=staff.department,
                designation=staff.designation,
            )
        )

    return StaffPayrollListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


# =====================================================
# PAYROLL SUMMARY
# =====================================================

@router.get(
    "/summary",
    response_model=StaffPayrollSummary,
)
def payroll_summary(
    payroll_month: int = Query(
        ...,
        ge=1,
        le=12,
    ),

    payroll_year: int = Query(
        ...,
        ge=2000,
        le=2100,
    ),

    db: Session = Depends(get_db),
):

    records = (
        db.query(StaffPayroll)
        .filter(
            StaffPayroll.payroll_month
            == payroll_month,

            StaffPayroll.payroll_year
            == payroll_year,
        )
        .all()
    )

    status_counts = {
        "DRAFT": 0,
        "PROCESSED": 0,
        "APPROVED": 0,
        "PAID": 0,
        "CANCELLED": 0,
    }

    total_gross = Decimal("0")
    total_deductions = Decimal("0")
    total_net = Decimal("0")

    for record in records:

        status = (
            record.status
            or "DRAFT"
        ).upper()

        if status in status_counts:
            status_counts[status] += 1

        total_gross += (
            record.gross_salary
            or Decimal("0")
        )

        total_deductions += (
            record.total_deductions
            or Decimal("0")
        )

        total_net += (
            record.net_salary
            or Decimal("0")
        )

    return StaffPayrollSummary(
        payroll_month=payroll_month,
        payroll_year=payroll_year,
        total_staff=len(records),
        total_payroll_records=len(records),
        draft=status_counts["DRAFT"],
        processed=status_counts["PROCESSED"],
        approved=status_counts["APPROVED"],
        paid=status_counts["PAID"],
        cancelled=status_counts["CANCELLED"],
        total_gross_salary=money(
            total_gross
        ),
        total_deductions=money(
            total_deductions
        ),
        total_net_salary=money(
            total_net
        ),
    )


# =====================================================
# CREATE PAYROLL
# =====================================================

@router.post(
    "",
    response_model=StaffPayrollResponse,
)
def create_payroll(
    payload: StaffPayrollCreate,
    db: Session = Depends(get_db),
):

    staff = get_active_staff(
        db,
        payload.staff_id,
    )

    existing = (
        db.query(StaffPayroll)
        .filter(
            StaffPayroll.staff_id
            == payload.staff_id,

            StaffPayroll.payroll_month
            == payload.payroll_month,

            StaffPayroll.payroll_year
            == payload.payroll_year,
        )
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=400,
            detail=(
                "Payroll already exists for "
                "this staff member for the "
                "selected month and year."
            ),
        )

    attendance = get_attendance_summary(
        db,
        payload.staff_id,
        payload.payroll_month,
        payload.payroll_year,
    )

    total_working_days = (
        payload.total_working_days
    )

    days_present = (
        payload.days_present
        if payload.days_present > 0
        else attendance["days_present"]
    )

    days_absent = (
        payload.days_absent
        if payload.days_absent > 0
        else attendance["days_absent"]
    )

    days_on_leave = (
        payload.days_on_leave
        if payload.days_on_leave > 0
        else attendance["days_on_leave"]
    )

    half_days = (
        payload.half_days
        if payload.half_days > 0
        else attendance["half_days"]
    )

    loss_of_pay_days = (
        payload.loss_of_pay_days
    )

    if loss_of_pay_days <= 0:

        loss_of_pay_days = (
            days_absent
            + (
                half_days
                * Decimal("0.5")
            )
        )

    basic_salary = money(
        payload.basic_salary
        if payload.basic_salary > 0
        else (
            staff.basic_salary
            or Decimal("0")
        )
    )

    allowances = money(
        payload.allowances
    )

    deductions = money(
        payload.deductions
    )

    overtime_amount = money(
        payload.overtime_amount
    )

    bonus_amount = money(
        payload.bonus_amount
    )

    loss_of_pay_amount = calculate_lop_amount(
        basic_salary,
        total_working_days,
        loss_of_pay_days,
    )

    gross_salary = calculate_gross_salary(
        basic_salary,
        allowances,
        overtime_amount,
        bonus_amount,
    )

    total_deductions = calculate_total_deductions(
        deductions,
        loss_of_pay_amount,
    )

    net_salary = calculate_net_salary(
        gross_salary,
        total_deductions,
    )

    payroll = StaffPayroll(
        staff_id=payload.staff_id,

        payroll_month=payload.payroll_month,

        payroll_year=payload.payroll_year,

        pay_date=payload.pay_date,

        total_working_days=total_working_days,

        days_present=days_present,

        days_absent=days_absent,

        days_on_leave=days_on_leave,

        half_days=half_days,

        loss_of_pay_days=loss_of_pay_days,

        basic_salary=basic_salary,

        allowances=allowances,

        deductions=deductions,

        loss_of_pay_amount=loss_of_pay_amount,

        overtime_amount=overtime_amount,

        bonus_amount=bonus_amount,

        gross_salary=gross_salary,

        total_deductions=total_deductions,

        net_salary=net_salary,

        status="DRAFT",

        payment_method=payload.payment_method,

        payment_reference=payload.payment_reference,

        payment_date=payload.payment_date,

        remarks=payload.remarks,
    )

    db.add(payroll)

    db.commit()

    db.refresh(payroll)

    return payroll


# =====================================================
# GET PAYROLL BY ID
# =====================================================

@router.get(
    "/{payroll_id}",
    response_model=StaffPayrollResponse,
)
def get_payroll(
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
            detail="Payroll record not found.",
        )

    return payroll


# =====================================================
# UPDATE PAYROLL
# =====================================================

@router.put(
    "/{payroll_id}",
    response_model=StaffPayrollResponse,
)
def update_payroll(
    payroll_id: int,
    payload: StaffPayrollUpdate,
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
            detail="Payroll record not found.",
        )

    if payroll.status in [
        "PAID",
        "CANCELLED",
    ]:

        raise HTTPException(
            status_code=400,
            detail=(
                "Paid or cancelled payroll "
                "cannot be edited."
            ),
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():

        if field in [
            "basic_salary",
            "allowances",
            "deductions",
            "overtime_amount",
            "bonus_amount",
            "loss_of_pay_amount",
            "gross_salary",
            "total_deductions",
            "net_salary",
        ]:
            value = money(value)

        setattr(
            payroll,
            field,
            value,
        )

    payroll.gross_salary = calculate_gross_salary(
        money(payroll.basic_salary),
        money(payroll.allowances),
        money(payroll.overtime_amount),
        money(payroll.bonus_amount),
    )

    payroll.total_deductions = (
        calculate_total_deductions(
            money(payroll.deductions),
            money(payroll.loss_of_pay_amount),
        )
    )

    payroll.net_salary = calculate_net_salary(
        money(payroll.gross_salary),
        money(payroll.total_deductions),
    )

    db.commit()

    db.refresh(payroll)

    return payroll


# =====================================================
# PROCESS PAYROLL
# =====================================================

@router.patch(
    "/{payroll_id}/process",
    response_model=StaffPayrollResponse,
)
def process_payroll(
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
            detail="Payroll record not found.",
        )

    if payroll.status != "DRAFT":

        raise HTTPException(
            status_code=400,
            detail=(
                "Only DRAFT payroll can "
                "be processed."
            ),
        )

    payroll.status = "PROCESSED"

    db.commit()

    db.refresh(payroll)

    return payroll


# =====================================================
# APPROVE PAYROLL
# =====================================================

@router.patch(
    "/{payroll_id}/approve",
    response_model=StaffPayrollResponse,
)
def approve_payroll(
    payroll_id: int,
    payload: StaffPayrollApproval,
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
            detail="Payroll record not found.",
        )

    if payroll.status != "PROCESSED":

        raise HTTPException(
            status_code=400,
            detail=(
                "Only PROCESSED payroll "
                "can be approved."
            ),
        )

    payroll.status = "APPROVED"

    payroll.approved_at = datetime.now()

    if payload.approval_remarks:

        payroll.remarks = (
            payload.approval_remarks
        )

    db.commit()

    db.refresh(payroll)

    return payroll


# =====================================================
# MARK PAYROLL AS PAID
# =====================================================

@router.patch(
    "/{payroll_id}/pay",
    response_model=StaffPayrollResponse,
)
def pay_payroll(
    payroll_id: int,
    payload: StaffPayrollPayment,
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
            detail="Payroll record not found.",
        )

    if payroll.status != "APPROVED":

        raise HTTPException(
            status_code=400,
            detail=(
                "Only APPROVED payroll "
                "can be marked as PAID."
            ),
        )

    payroll.status = "PAID"

    payroll.payment_method = (
        payload.payment_method
    )

    payroll.payment_reference = (
        payload.payment_reference
    )

    payroll.payment_date = (
        payload.payment_date
        or date.today()
    )

    if payload.remarks:

        payroll.remarks = (
            payload.remarks
        )

    db.commit()

    db.refresh(payroll)

    return payroll


# =====================================================
# CANCEL PAYROLL
# =====================================================

@router.patch(
    "/{payroll_id}/cancel",
    response_model=StaffPayrollResponse,
)
def cancel_payroll(
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
            detail="Payroll record not found.",
        )

    if payroll.status == "PAID":

        raise HTTPException(
            status_code=400,
            detail=(
                "Paid payroll cannot "
                "be cancelled."
            ),
        )

    payroll.status = "CANCELLED"

    db.commit()

    db.refresh(payroll)

    return payroll


# =====================================================
# DELETE PAYROLL
# =====================================================

@router.delete(
    "/{payroll_id}",
)
def delete_payroll(
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
            detail="Payroll record not found.",
        )

    if payroll.status not in [
        "DRAFT",
        "CANCELLED",
    ]:

        raise HTTPException(
            status_code=400,
            detail=(
                "Only DRAFT or CANCELLED "
                "payroll can be deleted."
            ),
        )

    db.delete(payroll)

    db.commit()

    return {
        "message": "Payroll deleted successfully.",
        "payroll_id": payroll_id,
    }