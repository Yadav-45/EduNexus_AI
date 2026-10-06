from sqlalchemy.orm import Session

from models.admission import Admission
from models.fee_account import FeeAccount
from models.student import Student
from models.user import User


ROLE_PERMISSIONS = {
    "OWNER": [
        "VIEW_SCHOOL_ANALYTICS",
        "VIEW_FINANCIAL_ANALYTICS",
        "VIEW_ADMISSIONS",
        "VIEW_STUDENTS",
        "VIEW_ATTENDANCE",
        "VIEW_ACADEMIC_ANALYTICS",
        "VIEW_OPERATIONAL_ANALYTICS",
        "USE_FORECASTING",
        "USE_SCENARIO_ANALYSIS",
        "USE_AI_RECOMMENDATIONS",
    ],
    "ADMIN": [
        "VIEW_ADMISSIONS",
        "VIEW_STUDENTS",
        "VIEW_ATTENDANCE",
        "VIEW_FINANCE_OPERATIONS",
        "VIEW_OPERATIONAL_ANALYTICS",
        "USE_AI_RECOMMENDATIONS",
    ],
    "TEACHER": [
        "VIEW_ASSIGNED_STUDENTS",
        "VIEW_ATTENDANCE",
        "VIEW_ASSIGNMENTS",
        "VIEW_EXAMS",
        "VIEW_ACADEMIC_DATA",
        "USE_TEACHING_ASSISTANT",
    ],
    "STUDENT": [
        "VIEW_OWN_PROFILE",
        "VIEW_OWN_ATTENDANCE",
        "VIEW_OWN_ASSIGNMENTS",
        "VIEW_OWN_EXAMS",
        "VIEW_OWN_RESULTS",
        "USE_LEARNING_ASSISTANT",
    ],
    "PARENT": [
        "VIEW_CHILD_PROFILE",
        "VIEW_CHILD_ATTENDANCE",
        "VIEW_CHILD_ASSIGNMENTS",
        "VIEW_CHILD_EXAMS",
        "VIEW_CHILD_RESULTS",
        "VIEW_CHILD_FEES",
    ],
}


ROLE_DATA = {
    "OWNER": [
        "school",
        "students",
        "admissions",
        "fees",
        "attendance",
        "academics",
        "analytics",
        "forecasting",
        "operations",
    ],
    "ADMIN": [
        "students",
        "admissions",
        "fees",
        "attendance",
        "operations",
    ],
    "TEACHER": [
        "assigned_students",
        "attendance",
        "assignments",
        "exams",
        "academic_performance",
        "timetable",
    ],
    "STUDENT": [
        "own_profile",
        "own_attendance",
        "own_assignments",
        "own_exams",
        "own_results",
        "own_timetable",
    ],
    "PARENT": [
        "child_profile",
        "child_attendance",
        "child_assignments",
        "child_exams",
        "child_results",
        "child_fees",
    ],
}


ROLE_CAPABILITIES = {
    "OWNER": [
        (
            "School Intelligence",
            "Ask questions about the overall school.",
        ),
        (
            "Financial Intelligence",
            "Analyze fees, payments and outstanding balances.",
        ),
        (
            "Admission Intelligence",
            "Analyze the admissions pipeline.",
        ),
        (
            "Forecasting",
            "Use future forecasting once ML models are connected.",
        ),
        (
            "Scenario Analysis",
            "Evaluate future school scenarios.",
        ),
        (
            "AI Recommendations",
            "Receive data-based management insights.",
        ),
    ],
    "ADMIN": [
        (
            "Administration Assistant",
            "Ask questions about administrative operations.",
        ),
        (
            "Admissions Assistant",
            "Review admission activity.",
        ),
        (
            "Finance Operations",
            "Review operational fee information.",
        ),
        (
            "Student Operations",
            "Review student and attendance information.",
        ),
    ],
    "TEACHER": [
        (
            "Teaching Assistant",
            "Ask questions about assigned students and classes.",
        ),
        (
            "Attendance Assistant",
            "Review attendance information.",
        ),
        (
            "Academic Assistant",
            "Work with assignments, exams and academic information.",
        ),
    ],
    "STUDENT": [
        (
            "Learning Assistant",
            "Ask questions about your own academic information.",
        ),
        (
            "Study Assistant",
            "Get help understanding academic topics.",
        ),
        (
            "Personal Progress",
            "Review your own learning information.",
        ),
    ],
    "PARENT": [
        (
            "Parent Assistant",
            "Ask questions about your child's school information.",
        ),
    ],
}


def get_role_permissions(role: str) -> list[str]:
    return ROLE_PERMISSIONS.get(role.upper(), [])


def get_role_data(role: str) -> list[str]:
    return ROLE_DATA.get(role.upper(), [])


def get_role_capabilities(role: str) -> list[dict]:
    capabilities = ROLE_CAPABILITIES.get(role.upper(), [])

    return [
        {
            "name": name,
            "description": description,
            "available": True,
        }
        for name, description in capabilities
    ]


def build_copilot_context(
    db: Session,
    user: User,
) -> dict:
    role = (user.role or "").upper()

    context = {
        "role": role,
        "user_id": user.id,
        "permissions": get_role_permissions(role),
        "available_data": get_role_data(role),
    }

    if role == "OWNER":
        context["school_metrics"] = {
            "active_students": (
                db.query(Student)
                .filter(Student.status == "ACTIVE")
                .count()
            ),
            "outstanding_fee_accounts": (
                db.query(FeeAccount)
                .filter(
                    FeeAccount.status == "ACTIVE",
                    FeeAccount.balance > 0,
                )
                .count()
            ),
            "total_outstanding": 0,
            "pending_admissions": (
                db.query(Admission)
                .filter(
                    Admission.status.in_(
                        ["APPLIED", "UNDER_REVIEW", "APPROVED"]
                    )
                )
                .count()
            ),
        }

        fee_accounts = (
            db.query(FeeAccount)
            .filter(
                FeeAccount.status == "ACTIVE",
                FeeAccount.balance > 0,
            )
            .all()
        )

        context["school_metrics"]["total_outstanding"] = float(
            sum(
                float(account.balance or 0)
                for account in fee_accounts
            )
        )

    elif role == "ADMIN":
        context["school_metrics"] = {
            "active_students": (
                db.query(Student)
                .filter(Student.status == "ACTIVE")
                .count()
            ),
            "pending_admissions": (
                db.query(Admission)
                .filter(
                    Admission.status.in_(
                        ["APPLIED", "UNDER_REVIEW", "APPROVED"]
                    )
                )
                .count()
            ),
        }

    return context


def generate_copilot_response(
    db: Session,
    user: User,
    question: str,
) -> dict:
    role = (user.role or "").upper()
    question_lower = question.lower().strip()

    context = build_copilot_context(
        db=db,
        user=user,
    )

    if role == "OWNER":
        metrics = context.get("school_metrics", {})

        if (
            "student" in question_lower
            and (
                "how many" in question_lower
                or "total" in question_lower
                or "count" in question_lower
            )
        ):
            answer = (
                f"The school currently has "
                f"{metrics.get('active_students', 0)} active students."
            )

        elif (
            "fee" in question_lower
            or "fees" in question_lower
            or "outstanding" in question_lower
        ):
            answer = (
                f"There are "
                f"{metrics.get('outstanding_fee_accounts', 0)} "
                f"active fee accounts with outstanding balances, "
                f"totalling ₹"
                f"{metrics.get('total_outstanding', 0):,.2f}."
            )

        elif "admission" in question_lower:
            answer = (
                f"There are currently "
                f"{metrics.get('pending_admissions', 0)} "
                f"admission applications in the active pipeline."
            )

        else:
            answer = (
                "I am connected to the school intelligence foundation. "
                "I can currently provide school-level information about "
                "students, fees and admissions. Forecasting, anomaly "
                "detection and deeper ML intelligence will be connected "
                "to this Copilot in the next intelligence layers."
            )

    elif role == "ADMIN":
        metrics = context.get("school_metrics", {})

        if "student" in question_lower:
            answer = (
                f"There are currently "
                f"{metrics.get('active_students', 0)} active students."
            )

        elif "admission" in question_lower:
            answer = (
                f"There are currently "
                f"{metrics.get('pending_admissions', 0)} "
                f"pending admission applications."
            )

        else:
            answer = (
                "I can currently help with student, admission and "
                "administrative information available to your role."
            )

    elif role == "TEACHER":
        answer = (
            "Your Teacher Copilot is connected to the role-aware "
            "intelligence layer. It will use your assigned classes, "
            "students, attendance, assignments and academic data."
        )

    elif role == "STUDENT":
        answer = (
            "Your Student Copilot is connected to your personal "
            "learning context. It will focus on your attendance, "
            "assignments, exams, results and learning support."
        )

    elif role == "PARENT":
        answer = (
            "Your Parent Copilot is connected to the information "
            "you are authorized to access about your child."
        )

    else:
        answer = (
            "Your account does not currently have a configured "
            "EduNexus Copilot role."
        )

    return {
        "success": True,
        "question": question,
        "role": role,
        "answer": answer,
        "source": "EduNexus AI Copilot Intelligence Layer",
        "context": context,
        "suggestions": get_suggestions(role),
    }


def get_suggestions(role: str) -> list[str]:
    suggestions = {
        "OWNER": [
            "How is my school performing?",
            "How much fee is outstanding?",
            "How many students are currently enrolled?",
            "How many admissions are pending?",
            "What should I review today?",
        ],
        "ADMIN": [
            "How many students are active?",
            "How many admissions are pending?",
            "What administrative work needs attention?",
        ],
        "TEACHER": [
            "Show my class information.",
            "How is my class performing?",
            "Which students need academic attention?",
            "Show attendance trends.",
        ],
        "STUDENT": [
            "Show my attendance.",
            "What assignments are pending?",
            "When is my next exam?",
            "Help me prepare for my exam.",
        ],
        "PARENT": [
            "How is my child doing?",
            "Show my child's attendance.",
            "What assignments are pending?",
            "What exams are coming up?",
        ],
    }

    return suggestions.get(role.upper(), [])