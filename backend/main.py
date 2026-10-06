from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine


# ============================================================
# MODELS
# ============================================================

from models.user import User
from models.student import Student
from models.parent import Parent
from models.parent_student import ParentStudent

from attendance_model import Attendance

from models.admission import Admission

from models.fee_account import FeeAccount
from models.fee_structure import FeeStructure
from models.fee_payment import FeePayment
from models.fee_receipt import FeeReceipt

from models.accounting_income import AccountingIncome
from models.accounting_expense import AccountingExpense

from models.staff import Staff
from models.staff_attendance import StaffAttendance
from models.staff_leave import StaffLeave
from models.staff_payroll import StaffPayroll
from models.payroll_payslip import PayrollPayslip

from models.exam import Exam
from models.exam_paper import ExamPaper
from models.exam_result import ExamResult


# ============================================================
# ROUTERS
# ============================================================

from auth.router import router as auth_router
from user_router import router as user_router
from student_router import router as student_router
from parent_router import router as parent_router
from parent_student_router import router as parent_student_router

from student_360_router import router as student_360_router

from attendance_router import router as attendance_router

from admission_router import router as admission_router
from enrollment_router import router as enrollment_router

from fee_structure_router import router as fee_structure_router
from fee_account_router import router as fee_account_router
from fee_payment_router import router as fee_payment_router
from fee_payment_reversal_router import (
    router as fee_payment_reversal_router
)
from fee_receipt_router import router as fee_receipt_router

from fee_dashboard_router import router as fee_dashboard_router
from fee_collection_analytics_router import (
    router as fee_collection_analytics_router
)
from outstanding_fees_router import (
    router as outstanding_fees_router
)
from student_fee_statement_router import (
    router as student_fee_statement_router
)

from fee_payment_audit_router import (
    router as fee_payment_audit_router
)
from fee_payment_audit_summary_router import (
    router as fee_payment_audit_summary_router
)

from fee_aging_router import (
    router as fee_aging_router
)

from fee_fine_policy_router import (
    router as fee_fine_policy_router
)

from fee_aging_summary_router import (
    router as fee_aging_summary_router
)

from fee_fine_automation_router import (
    router as fee_fine_automation_router
)

from fee_fine_router import (
    router as fee_fine_router
)

from fee_fine_adjustment_router import (
    router as fee_fine_adjustment_router
)

from fee_fine_adjustment_history_router import (
    router as fee_fine_adjustment_history_router
)

from fee_fine_adjustment_summary_router import (
    router as fee_fine_adjustment_summary_router
)

from fee_fine_dashboard_router import (
    router as fee_fine_dashboard_router
)

from fee_fine_analytics_router import (
    router as fee_fine_analytics_router
)

from course_router import router as course_router
from assignment_router import router as assignment_router
from ai_tutor_router import router as ai_tutor_router

from profile_router import router as profile_router

from accounting_router import router as accounting_router
from accounting_dashboard_router import (
    router as accounting_dashboard_router
)

from transport_router import router as transport_router

from inventory_router import router as inventory_router

from communication_router import (
    router as communication_router
)

from document_router import router as document_router

from analytics_router import router as analytics_router

from staff_router import router as staff_router

from staff_attendance_router import (
    router as staff_attendance_router
)

from staff_leave_router import (
    router as staff_leave_router
)

from staff_payroll_router import (
    router as staff_payroll_router
)

from payroll_payslip_router import (
    router as payroll_payslip_router
)

from staff_performance_router import (
    router as staff_performance_router
)

from exam_router import (
    router as exam_router
)

from exam_paper_router import (
    router as exam_paper_router
)

from exam_result_router import (
    router as exam_result_router
)


# ============================================================
# FINE SCHEDULER
# ============================================================

try:
    from fee_fine_scheduler import (
        start_fine_scheduler,
        stop_fine_scheduler,
    )
except ImportError:
    start_fine_scheduler = None
    stop_fine_scheduler = None


# ============================================================
# LIFESPAN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    Base.metadata.create_all(
        bind=engine
    )

    if start_fine_scheduler:
        try:
            start_fine_scheduler()
        except Exception as exc:
            print(
                "Fine scheduler could not start:",
                exc,
            )

    yield

    if stop_fine_scheduler:
        try:
            stop_fine_scheduler()
        except Exception as exc:
            print(
                "Fine scheduler could not stop:",
                exc,
            )


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="EduNexus AI",
    description="Intelligent School Operating System",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(auth_router)
app.include_router(user_router)

app.include_router(student_router)
app.include_router(parent_router)
app.include_router(parent_student_router)
app.include_router(student_360_router)

app.include_router(attendance_router)

app.include_router(admission_router)
app.include_router(enrollment_router)

# ============================================================
# FEES
# ============================================================

app.include_router(fee_structure_router)
app.include_router(fee_account_router)
app.include_router(fee_payment_router)
app.include_router(fee_payment_reversal_router)
app.include_router(fee_receipt_router)

app.include_router(fee_dashboard_router)
app.include_router(fee_collection_analytics_router)
app.include_router(outstanding_fees_router)
app.include_router(student_fee_statement_router)

app.include_router(fee_payment_audit_router)
app.include_router(fee_payment_audit_summary_router)

app.include_router(fee_aging_router)
app.include_router(fee_fine_policy_router)
app.include_router(fee_aging_summary_router)
app.include_router(fee_fine_automation_router)
app.include_router(fee_fine_router)

app.include_router(fee_fine_adjustment_router)
app.include_router(fee_fine_adjustment_history_router)
app.include_router(fee_fine_adjustment_summary_router)
app.include_router(fee_fine_dashboard_router)
app.include_router(fee_fine_analytics_router)

# ============================================================
# ACADEMIC
# ============================================================

app.include_router(course_router)
app.include_router(assignment_router)
app.include_router(ai_tutor_router)

# ============================================================
# PROFILE
# ============================================================

app.include_router(profile_router)

# ============================================================
# ACCOUNTING
# ============================================================

app.include_router(accounting_router)
app.include_router(accounting_dashboard_router)

# ============================================================
# TRANSPORT
# ============================================================

app.include_router(transport_router)

# ============================================================
# INVENTORY
# ============================================================

app.include_router(inventory_router)

# ============================================================
# COMMUNICATION
# ============================================================

app.include_router(communication_router)

# ============================================================
# DOCUMENTS
# ============================================================

app.include_router(document_router)

# ============================================================
# ANALYTICS
# ============================================================

app.include_router(analytics_router)

# ============================================================
# STAFF
# ============================================================

app.include_router(staff_router)
app.include_router(staff_attendance_router)
app.include_router(staff_leave_router)
app.include_router(staff_payroll_router)
app.include_router(payroll_payslip_router)
app.include_router(staff_performance_router)

# ============================================================
# EXAMINATIONS
# ============================================================

app.include_router(exam_router)
app.include_router(exam_paper_router)
app.include_router(exam_result_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "EduNexus AI backend is running",
        "status": "success",
        "version": "1.0.0",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "EduNexus AI",
    }