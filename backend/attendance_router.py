from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.student import Student
from attendance_model import Attendance
from auth.dependencies import require_roles


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


VALID_STATUSES = {
    "PRESENT",
    "ABSENT",
    "LATE",
    "LEAVE",
}


class AttendanceRecord(BaseModel):
    student_id: int
    status: str
    remarks: str | None = None


class BulkAttendanceRequest(BaseModel):
    attendance_date: date
    records: list[AttendanceRecord]


class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    attendance_date: date
    status: str
    remarks: str | None
    marked_by: int | None

    class Config:
        from_attributes = True


def validate_status(status_value: str):
    status_value = status_value.upper()

    if status_value not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid attendance status. "
                "Use PRESENT, ABSENT, LATE, or LEAVE."
            ),
        )

    return status_value


@router.get(
    "",
)
def get_attendance(
    attendance_date: date | None = Query(
        default=None,
    ),
    class_name: str | None = Query(
        default=None,
    ),
    section: str | None = Query(
        default=None,
    ),
    search: str | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "TEACHER",
        )
    ),
):
    query = (
        db.query(Attendance, Student)
        .join(
            Student,
            Student.id == Attendance.student_id,
        )
    )

    if attendance_date:
        query = query.filter(
            Attendance.attendance_date == attendance_date
        )

    if class_name:
        query = query.filter(
            Student.class_name == class_name
        )

    if section:
        query = query.filter(
            Student.section == section
        )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            (
                Student.first_name.ilike(search_value)
            )
            | (
                Student.last_name.ilike(search_value)
            )
            | (
                Student.admission_number.ilike(
                    search_value
                )
            )
        )

    results = (
        query
        .order_by(
            Student.first_name.asc(),
            Student.last_name.asc(),
        )
        .all()
    )

    response = []

    for attendance, student in results:
        response.append(
            {
                "id": attendance.id,
                "student_id": student.id,
                "student_name": " ".join(
                    filter(
                        None,
                        [
                            student.first_name,
                            student.last_name,
                        ],
                    )
                ),
                "admission_number":
                    student.admission_number,
                "class_name":
                    student.class_name,
                "section":
                    student.section,
                "attendance_date":
                    attendance.attendance_date,
                "status":
                    attendance.status,
                "remarks":
                    attendance.remarks,
            }
        )

    return response


@router.post(
    "/bulk",
)
def save_bulk_attendance(
    request: BulkAttendanceRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "TEACHER",
        )
    ),
):
    if not request.records:
        raise HTTPException(
            status_code=400,
            detail="No attendance records were provided.",
        )

    saved_records = []

    for record in request.records:
        status_value = validate_status(
            record.status
        )

        student = (
            db.query(Student)
            .filter(
                Student.id == record.student_id
            )
            .first()
        )

        if not student:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Student {record.student_id} "
                    "not found."
                ),
            )

        existing = (
            db.query(Attendance)
            .filter(
                Attendance.student_id
                == record.student_id,
                Attendance.attendance_date
                == request.attendance_date,
            )
            .first()
        )

        if existing:
            existing.status = status_value
            existing.remarks = record.remarks
            existing.marked_by = current_user.id

            saved_records.append(existing)
        else:
            attendance = Attendance(
                student_id=record.student_id,
                attendance_date=request.attendance_date,
                status=status_value,
                remarks=record.remarks,
                marked_by=current_user.id,
            )

            db.add(attendance)
            saved_records.append(attendance)

    db.commit()

    for record in saved_records:
        db.refresh(record)

    return {
        "message": (
            "Attendance saved successfully."
        ),
        "date": request.attendance_date,
        "count": len(saved_records),
    }


@router.get(
    "/student/{student_id}",
)
def get_student_attendance(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "TEACHER",
        )
    ),
):
    student = (
        db.query(Student)
        .filter(Student.id == student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    records = (
        db.query(Attendance)
        .filter(
            Attendance.student_id == student_id
        )
        .order_by(
            Attendance.attendance_date.desc()
        )
        .all()
    )

    total = len(records)

    present = sum(
        1
        for record in records
        if record.status == "PRESENT"
    )

    late = sum(
        1
        for record in records
        if record.status == "LATE"
    )

    absent = sum(
        1
        for record in records
        if record.status == "ABSENT"
    )

    leave = sum(
        1
        for record in records
        if record.status == "LEAVE"
    )

    attendance_percentage = (
        round(
            ((present + late) / total) * 100,
            2,
        )
        if total
        else 0
    )

    return {
        "student_id": student.id,
        "student_name": " ".join(
            filter(
                None,
                [
                    student.first_name,
                    student.last_name,
                ],
            )
        ),
        "total_days": total,
        "present": present,
        "late": late,
        "absent": absent,
        "leave": leave,
        "attendance_percentage":
            attendance_percentage,
        "records": [
            {
                "id": record.id,
                "date":
                    record.attendance_date,
                "status":
                    record.status,
                "remarks":
                    record.remarks,
            }
            for record in records
        ],
    }


@router.get(
    "/summary",
)
def get_attendance_summary(
    attendance_date: date,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "OWNER",
            "ADMIN",
            "TEACHER",
        )
    ),
):
    records = (
        db.query(Attendance)
        .filter(
            Attendance.attendance_date
            == attendance_date
        )
        .all()
    )

    total = len(records)

    present = sum(
        1
        for record in records
        if record.status == "PRESENT"
    )

    absent = sum(
        1
        for record in records
        if record.status == "ABSENT"
    )

    late = sum(
        1
        for record in records
        if record.status == "LATE"
    )

    leave = sum(
        1
        for record in records
        if record.status == "LEAVE"
    )

    marked_percentage = (
        round(
            (total / db.query(Student).count())
            * 100,
            2,
        )
        if db.query(Student).count()
        else 0
    )

    return {
        "date": attendance_date,
        "total_marked": total,
        "present": present,
        "absent": absent,
        "late": late,
        "leave": leave,
        "marked_percentage":
            marked_percentage,
    }