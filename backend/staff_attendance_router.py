from datetime import date, datetime, time
from math import ceil
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models.staff import Staff
from models.staff_attendance import StaffAttendance

from staff_attendance_schemas import (
    StaffAttendanceCreate,
    StaffAttendanceUpdate,
    StaffAttendanceResponse,
    StaffAttendanceListResponse,
    StaffAttendanceListItem,
    StaffAttendanceSummary,
)

from auth.dependencies import get_current_user


router = APIRouter(
    prefix="/staff-attendance",
    tags=["Staff Attendance"],
)


# ============================================================
# AUTHORIZATION
# ============================================================

def require_staff_attendance_manager(
    current_user=Depends(get_current_user),
):
    role = getattr(current_user, "role", None)

    if hasattr(role, "value"):
        role = role.value

    if str(role).upper() not in {
        "OWNER",
        "ADMIN",
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only school owners and administrators "
                "can manage staff attendance."
            ),
        )

    return current_user


# ============================================================
# WORKING HOURS CALCULATOR
# ============================================================

def calculate_working_hours(
    check_in: Optional[time],
    check_out: Optional[time],
) -> Optional[str]:

    if not check_in or not check_out:
        return None

    check_in_minutes = (
        check_in.hour * 60
        + check_in.minute
        + check_in.second / 60
    )

    check_out_minutes = (
        check_out.hour * 60
        + check_out.minute
        + check_out.second / 60
    )

    # Prevent negative duration
    if check_out_minutes < check_in_minutes:
        return None

    total_minutes = int(
        check_out_minutes - check_in_minutes
    )

    hours = total_minutes // 60
    minutes = total_minutes % 60

    return f"{hours}h {minutes}m"


# ============================================================
# CREATE ATTENDANCE
# ============================================================

@router.post(
    "",
    response_model=StaffAttendanceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_staff_attendance(
    payload: StaffAttendanceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_staff_attendance_manager
    ),
):

    # --------------------------------------------------------
    # CHECK STAFF
    # --------------------------------------------------------

    staff = (
        db.query(Staff)
        .filter(
            Staff.id == payload.staff_id,
            Staff.is_deleted.is_(False),
        )
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found.",
        )

    # --------------------------------------------------------
    # CHECK DUPLICATE
    # --------------------------------------------------------

    existing = (
        db.query(StaffAttendance)
        .filter(
            StaffAttendance.staff_id
            == payload.staff_id,
            StaffAttendance.attendance_date
            == payload.attendance_date,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Attendance already exists for this "
                "staff member on this date."
            ),
        )

    # --------------------------------------------------------
    # CALCULATE WORKING HOURS
    # --------------------------------------------------------

    working_hours = calculate_working_hours(
        payload.check_in,
        payload.check_out,
    )

    attendance = StaffAttendance(
        staff_id=payload.staff_id,
        attendance_date=payload.attendance_date,
        status=payload.status.upper(),
        check_in=payload.check_in,
        check_out=payload.check_out,
        working_hours=working_hours,
        remarks=payload.remarks,
    )

    db.add(attendance)

    try:
        db.commit()
        db.refresh(attendance)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not create staff attendance record."
            ),
        )

    return attendance


# ============================================================
# LIST ATTENDANCE
# ============================================================

@router.get(
    "",
    response_model=StaffAttendanceListResponse,
)
def list_staff_attendance(
    page: int = Query(
        1,
        ge=1,
    ),

    page_size: int = Query(
        25,
        ge=1,
        le=100,
    ),

    attendance_date: Optional[date] = Query(
        None,
    ),

    status_filter: Optional[str] = Query(
        None,
        alias="status",
        max_length=30,
    ),

    search: Optional[str] = Query(
        None,
        max_length=100,
    ),

    department: Optional[str] = Query(
        None,
        max_length=100,
    ),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_staff_attendance_manager
    ),
):

    # --------------------------------------------------------
    # JOIN STAFF
    # --------------------------------------------------------

    query = (
        db.query(
            StaffAttendance,
            Staff,
        )
        .join(
            Staff,
            Staff.id
            == StaffAttendance.staff_id,
        )
        .filter(
            Staff.is_deleted.is_(False),
        )
    )

    # --------------------------------------------------------
    # DATE FILTER
    # --------------------------------------------------------

    if attendance_date:
        query = query.filter(
            StaffAttendance.attendance_date
            == attendance_date
        )

    # --------------------------------------------------------
    # STATUS FILTER
    # --------------------------------------------------------

    if status_filter:
        query = query.filter(
            StaffAttendance.status.ilike(
                status_filter.strip()
            )
        )

    # --------------------------------------------------------
    # DEPARTMENT FILTER
    # --------------------------------------------------------

    if department:
        query = query.filter(
            Staff.department.ilike(
                department.strip()
            )
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
                Staff.staff_id.ilike(
                    search_term
                ),
                Staff.first_name.ilike(
                    search_term
                ),
                Staff.last_name.ilike(
                    search_term
                ),
                Staff.email.ilike(
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

    # --------------------------------------------------------
    # PAGINATION
    # --------------------------------------------------------

    records = (
        query
        .order_by(
            StaffAttendance.attendance_date.desc(),
            StaffAttendance.id.desc(),
        )
        .offset(
            (page - 1) * page_size
        )
        .limit(page_size)
        .all()
    )

    # --------------------------------------------------------
    # RESPONSE ITEMS
    # --------------------------------------------------------

    items = []

    for attendance, staff in records:

        items.append(
            StaffAttendanceListItem(
                id=attendance.id,

                staff_id=attendance.staff_id,

                attendance_date=(
                    attendance.attendance_date
                ),

                status=attendance.status,

                check_in=attendance.check_in,

                check_out=attendance.check_out,

                working_hours=(
                    attendance.working_hours
                ),

                remarks=attendance.remarks,

                created_at=(
                    attendance.created_at
                ),

                updated_at=(
                    attendance.updated_at
                ),

                staff_code=staff.staff_id,

                staff_name=(
                    f"{staff.first_name} "
                    f"{staff.last_name}"
                ).strip(),

                department=staff.department,

                designation=staff.designation,
            )
        )

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (
            ceil(total / page_size)
            if total
            else 0
        ),
    }


# ============================================================
# DAILY SUMMARY
# ============================================================

@router.get(
    "/summary",
    response_model=StaffAttendanceSummary,
)
def staff_attendance_summary(
    attendance_date: Optional[date] = Query(
        None,
    ),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_staff_attendance_manager
    ),
):

    selected_date = (
        attendance_date
        or date.today()
    )

    # --------------------------------------------------------
    # ACTIVE STAFF
    # --------------------------------------------------------

    total_staff = (
        db.query(Staff)
        .filter(
            Staff.is_deleted.is_(False),
            Staff.status.ilike("ACTIVE"),
        )
        .count()
    )

    # --------------------------------------------------------
    # ATTENDANCE RECORDS
    # --------------------------------------------------------

    records = (
        db.query(StaffAttendance)
        .join(
            Staff,
            Staff.id
            == StaffAttendance.staff_id,
        )
        .filter(
            Staff.is_deleted.is_(False),
            StaffAttendance.attendance_date
            == selected_date,
        )
        .all()
    )

    present = 0
    absent = 0
    half_day = 0
    late = 0
    on_leave = 0
    holiday = 0
    week_off = 0

    for record in records:

        record_status = (
            record.status or ""
        ).upper()

        if record_status == "PRESENT":
            present += 1

        elif record_status == "ABSENT":
            absent += 1

        elif record_status == "HALF_DAY":
            half_day += 1

        elif record_status == "LATE":
            late += 1

        elif record_status == "ON_LEAVE":
            on_leave += 1

        elif record_status == "HOLIDAY":
            holiday += 1

        elif record_status == "WEEK_OFF":
            week_off += 1

    return {
        "date": selected_date,

        "total_staff": total_staff,

        "present": present,

        "absent": absent,

        "half_day": half_day,

        "late": late,

        "on_leave": on_leave,

        "holiday": holiday,

        "week_off": week_off,
    }


# ============================================================
# GET SINGLE ATTENDANCE
# ============================================================

@router.get(
    "/{attendance_id}",
    response_model=StaffAttendanceResponse,
)
def get_staff_attendance(
    attendance_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_staff_attendance_manager
    ),
):

    attendance = (
        db.query(StaffAttendance)
        .filter(
            StaffAttendance.id
            == attendance_id,
        )
        .first()
    )

    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Staff attendance record not found."
            ),
        )

    return attendance


# ============================================================
# UPDATE ATTENDANCE
# ============================================================

@router.put(
    "/{attendance_id}",
    response_model=StaffAttendanceResponse,
)
def update_staff_attendance(
    attendance_id: int,

    payload: StaffAttendanceUpdate,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_staff_attendance_manager
    ),
):

    attendance = (
        db.query(StaffAttendance)
        .filter(
            StaffAttendance.id
            == attendance_id,
        )
        .first()
    )

    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Staff attendance record not found."
            ),
        )

    # --------------------------------------------------------
    # UPDATE FIELDS
    # --------------------------------------------------------

    update_data = payload.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():

        if (
            field == "status"
            and value is not None
        ):
            value = value.upper()

        setattr(
            attendance,
            field,
            value,
        )

    # --------------------------------------------------------
    # RECALCULATE WORKING HOURS
    # --------------------------------------------------------

    attendance.working_hours = (
        calculate_working_hours(
            attendance.check_in,
            attendance.check_out,
        )
    )

    try:
        db.commit()
        db.refresh(attendance)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not update staff attendance."
            ),
        )

    return attendance


# ============================================================
# DELETE ATTENDANCE
# ============================================================

@router.delete(
    "/{attendance_id}"
)
def delete_staff_attendance(
    attendance_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_staff_attendance_manager
    ),
):

    attendance = (
        db.query(StaffAttendance)
        .filter(
            StaffAttendance.id
            == attendance_id,
        )
        .first()
    )

    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Staff attendance record not found."
            ),
        )

    db.delete(attendance)

    try:
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not delete staff attendance."
            ),
        )

    return {
        "message": (
            "Staff attendance deleted successfully."
        ),
        "attendance_id": attendance_id,
    }