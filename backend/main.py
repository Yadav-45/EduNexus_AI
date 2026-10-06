from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

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
from fee_structure_router import router as fee_structure_router
from fee_receipt_router import router as fee_receipt_router
from fee_dashboard_router import router as fee_dashboard_router

from accounting_router import router as accounting_router
from accounting_dashboard_router import router as accounting_dashboard_router

from transport_router import router as transport_router

from inventory_router import router as inventory_router

from communication_router import router as communication_router

from document_router import router as document_router

from analytics_router import router as analytics_router


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
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local development
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Production frontend
        "https://edunexus-ai-qiua.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# DATABASE TABLE CREATION
# =========================

Base.metadata.create_all(bind=engine)


# =========================
# ROUTE REGISTRATION
# =========================

app.include_router(auth_router)

app.include_router(user_router)

app.include_router(student_router)
app.include_router(parent_router)
app.include_router(parent_student_router)
app.include_router(student_360_router)

app.include_router(attendance_router)

app.include_router(admission_router)
app.include_router(enrollment_router)

app.include_router(fee_account_router)
app.include_router(fee_payment_router)
app.include_router(fee_structure_router)
app.include_router(fee_receipt_router)
app.include_router(fee_dashboard_router)

app.include_router(accounting_router)
app.include_router(accounting_dashboard_router)

app.include_router(transport_router)

app.include_router(inventory_router)

app.include_router(communication_router)

app.include_router(document_router)

app.include_router(analytics_router)


# =========================
# ROOT
# =========================

@app.get("/")
def root():
    return {
        "message": "Welcome to EduNexus AI",
        "status": "running",
    }


# =========================
# HEALTH CHECK
# =========================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "EduNexus AI",
    }