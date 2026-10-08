import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine, get_db
from auth.security import hash_password


# =========================
# MODELS
# =========================

from models.user import User
from models.student import Student
from models.parent import Parent
from models.parent_student import ParentStudent
from attendance_model import Attendance

from models.admission import Admission

from models.fee_account import FeeAccount
from models.fee_payment import FeePayment
from models.fee_structure import FeeStructure
from models.fee_receipt import FeeReceipt

from models.accounting_income import AccountingIncome
from models.accounting_expense import AccountingExpense

from models.transport_vehicle import TransportVehicle
from models.transport_driver import TransportDriver
from models.transport_route import TransportRoute
from models.student_transport import StudentTransport

from models.inventory_category import InventoryCategory
from models.inventory_supplier import InventorySupplier
from models.inventory_item import InventoryItem
from models.inventory_movement import InventoryMovement

from models.communication_notice import CommunicationNotice
from models.communication_recipient import CommunicationRecipient

from models.document_category import DocumentCategory
from models.document import Document

from models.staff import Staff
from models.staff_attendance import StaffAttendance
from models.staff_leave import StaffLeave
from models.staff_payroll import StaffPayroll
from models.payroll_payslip import PayrollPayslip

from models.exam import Exam
from models.exam_paper import ExamPaper
from models.exam_result import ExamResult


# =========================
# ROUTERS
# =========================

from auth.router import router as auth_router
from user_router import router as user_router
from student_router import router as student_router
from parent_router import router as parent_router
from parent_student_router import router as parent_student_router
from student_360_router import router as student_360_router

from attendance_router import router as attendance_router
from admission_router import router as admission_router
from enrollment_router import router as enrollment_router

from fee_account_router import router as fee_account_router
from fee_payment_router import router as fee_payment_router
from fee_payment_reversal_router import router as fee_payment_reversal_router
from fee_structure_router import router as fee_structure_router
from fee_receipt_router import router as fee_receipt_router
from fee_dashboard_router import router as fee_dashboard_router
from fee_collection_analytics_router import (
    router as fee_collection_analytics_router,
)
from outstanding_fees_router import router as outstanding_fees_router
from student_fee_statement_router import (
    router as student_fee_statement_router,
)
from fee_payment_audit_router import router as fee_payment_audit_router
from fee_payment_audit_summary_router import (
    router as fee_payment_audit_summary_router,
)
from fee_aging_router import router as fee_aging_router
from fee_aging_summary_router import router as fee_aging_summary_router
from fee_fine_policy_router import router as fee_fine_policy_router
from fee_fine_automation_router import router as fee_fine_automation_router
from fee_fine_router import router as fee_fine_router
from fee_fine_adjustment_router import router as fee_fine_adjustment_router
from fee_fine_adjustment_history_router import (
    router as fee_fine_adjustment_history_router,
)
from fee_fine_adjustment_summary_router import (
    router as fee_fine_adjustment_summary_router,
)
from fee_fine_dashboard_router import router as fee_fine_dashboard_router
from fee_fine_analytics_router import router as fee_fine_analytics_router
from fee_notification_router import router as fee_notification_router
from fee_notification_template_router import (
    router as fee_notification_template_router,
)

from course_router import router as course_router
from assignment_router import router as assignment_router
from ai_tutor_router import router as ai_tutor_router

from ai_copilot_router import router as ai_copilot_router
from school_intelligence_router import router as school_intelligence_router
from school_intelligence_features_router import (
    router as school_intelligence_features_router,
)
from school_intelligence_trend_router import (
    router as school_intelligence_trend_router,
)

from profile_router import router as profile_router

from accounting_router import router as accounting_router
from accounting_dashboard_router import (
    router as accounting_dashboard_router,
)

from transport_router import router as transport_router
from inventory_router import router as inventory_router
from communication_router import router as communication_router
from document_router import router as document_router
from analytics_router import router as analytics_router

from staff_router import router as staff_router
from staff_attendance_router import router as staff_attendance_router
from staff_leave_router import router as staff_leave_router
from staff_payroll_router import router as staff_payroll_router
from payroll_payslip_router import router as payroll_payslip_router
from staff_performance_router import router as staff_performance_router

from exam_router import router as exam_router
from exam_paper_router import router as exam_paper_router
from exam_result_router import router as exam_result_router


# =========================
# FINE SCHEDULER
# =========================

try:
    from fee_fine_scheduler import (
        start_fine_scheduler,
        stop_fine_scheduler,
    )
except ImportError:
    start_fine_scheduler = None
    stop_fine_scheduler = None


# =========================
# DEFAULT OWNER ACCOUNT
# =========================

def ensure_default_owner():
    """
    Create or update the default OWNER account using
    environment variables.
    """
    email = os.getenv("DEFAULT_OWNER_EMAIL")
    password = os.getenv("DEFAULT_OWNER_PASSWORD")

    if not email or not password:
        return

    db = next(get_db())
    try:
        owner = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if owner is None:
            owner = User(
                full_name="EduNexus Owner",
                email=email,
                password_hash=hash_password(password),
                role="OWNER",
                is_active=True,
            )
            db.add(owner)
            db.commit()
            db.refresh(owner)
            print(f"Default owner account created successfully: {email}")
        else:
            owner.password_hash = hash_password(password)
            owner.role = "OWNER"
            owner.is_active = True
            db.commit()
            db.refresh(owner)
            print(f"Default owner account updated successfully: {email}")

    except Exception as exc:
        db.rollback()
        print(f"ERROR: Failed to create/update default owner: {exc}")
    finally:
        db.close()


# =========================
# LIFESPAN
# =========================

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_default_owner()

    if start_fine_scheduler:
        try:
            start_fine_scheduler()
        except Exception as exc:
            print("Fine scheduler could not start:", exc)

    yield

    if stop_fine_scheduler:
        try:
            stop_fine_scheduler()
        except Exception as exc:
            print("Fine scheduler could not stop:", exc)


# =========================
# APPLICATION
# =========================

app = FastAPI(
    title="EduNexus AI",
    description=(
        "Intelligent School Operating System and "
        "AI-Powered Financial Intelligence Platform"
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# =========================
# CORS
# =========================

allowed_origins = [
    # Local development
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",

    # Render frontends
    "https://edunexus-ai-qiua.onrender.com",
]

# Allow any additional custom origins via environment variable
custom_origins = os.getenv("CORS_ORIGINS", "")
if custom_origins:
    for origin in custom_origins.split(","):
        origin = origin.strip()
        if origin and origin not in allowed_origins:
            allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ROUTE REGISTRATION
# =========================

# Auth & Users
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(profile_router)

# Students & Parents
app.include_router(student_router)
app.include_router(parent_router)
app.include_router(parent_student_router)
app.include_router(student_360_router)

# Admissions & Attendance
app.include_router(attendance_router)
app.include_router(admission_router)
app.include_router(enrollment_router)

# Fees
app.include_router(fee_account_router)
app.include_router(fee_payment_router)
app.include_router(fee_payment_reversal_router)
app.include_router(fee_structure_router)
app.include_router(fee_receipt_router)
app.include_router(fee_dashboard_router)
app.include_router(fee_collection_analytics_router)
app.include_router(outstanding_fees_router)
app.include_router(student_fee_statement_router)
app.include_router(fee_payment_audit_router)
app.include_router(fee_payment_audit_summary_router)
app.include_router(fee_aging_router)
app.include_router(fee_aging_summary_router)
app.include_router(fee_fine_policy_router)
app.include_router(fee_fine_automation_router)
app.include_router(fee_fine_router)
app.include_router(fee_fine_adjustment_router)
app.include_router(fee_fine_adjustment_history_router)
app.include_router(fee_fine_adjustment_summary_router)
app.include_router(fee_fine_dashboard_router)
app.include_router(fee_fine_analytics_router)
app.include_router(fee_notification_router)
app.include_router(fee_notification_template_router)

# Academic & Courses
app.include_router(course_router)
app.include_router(assignment_router)
app.include_router(ai_tutor_router)

# AI Copilot & School Intelligence
app.include_router(ai_copilot_router)
app.include_router(school_intelligence_router)
app.include_router(school_intelligence_features_router)
app.include_router(school_intelligence_trend_router)

# Accounting, Transport, Inventory, Communication, Documents, Analytics
app.include_router(accounting_router)
app.include_router(accounting_dashboard_router)
app.include_router(transport_router)
app.include_router(inventory_router)
app.include_router(communication_router)
app.include_router(document_router)
app.include_router(analytics_router)

# Staff & Payroll
app.include_router(staff_router)
app.include_router(staff_attendance_router)
app.include_router(staff_leave_router)
app.include_router(staff_payroll_router)
app.include_router(payroll_payslip_router)
app.include_router(staff_performance_router)

# Examinations
app.include_router(exam_router)
app.include_router(exam_paper_router)
app.include_router(exam_result_router)


# =========================
# ROOT & HEALTH CHECK
# =========================

@app.get("/")
def root():
    return {
        "message": "Welcome to EduNexus AI",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "EduNexus AI",
    }