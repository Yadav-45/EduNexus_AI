from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import require_roles
from database import get_db
from models.user import User

from ai_copilot_schemas import (
    CopilotCapabilitiesResponse,
    CopilotContextResponse,
    CopilotRequest,
    CopilotResponse,
)
from ai_copilot_service import (
    build_copilot_context,
    generate_copilot_response,
    get_role_capabilities,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI Copilot"],
)


ALL_COPILOT_ROLES = (
    "OWNER",
    "ADMIN",
    "TEACHER",
    "STUDENT",
    "PARENT",
)


@router.post(
    "/copilot",
    response_model=CopilotResponse,
)
def copilot(
    request: CopilotRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*ALL_COPILOT_ROLES)
    ),
):
    return generate_copilot_response(
        db=db,
        user=current_user,
        question=request.question,
    )


@router.get(
    "/copilot/capabilities",
    response_model=CopilotCapabilitiesResponse,
)
def copilot_capabilities(
    current_user: User = Depends(
        require_roles(*ALL_COPILOT_ROLES)
    ),
):
    role = (current_user.role or "").upper()

    return {
        "success": True,
        "role": role,
        "capabilities": get_role_capabilities(role),
    }


@router.get(
    "/copilot/context",
    response_model=CopilotContextResponse,
)
def copilot_context(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*ALL_COPILOT_ROLES)
    ),
):
    context = build_copilot_context(
        db=db,
        user=current_user,
    )

    return {
        "success": True,
        "role": context["role"],
        "user_id": context["user_id"],
        "context_type": "ROLE_AWARE_SCHOOL_INTELLIGENCE",
        "permissions": context["permissions"],
        "available_data": context["available_data"],
    }