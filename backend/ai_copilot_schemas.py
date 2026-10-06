from typing import Any, Optional

from pydantic import BaseModel, Field


class CopilotRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)


class CopilotCapability(BaseModel):
    name: str
    description: str
    available: bool


class CopilotCapabilitiesResponse(BaseModel):
    success: bool
    role: str
    capabilities: list[CopilotCapability]


class CopilotContextResponse(BaseModel):
    success: bool
    role: str
    user_id: int
    context_type: str
    permissions: list[str]
    available_data: list[str]


class CopilotResponse(BaseModel):
    success: bool
    question: str
    role: str
    answer: str
    source: str
    context: dict[str, Any]
    suggestions: list[str] = []