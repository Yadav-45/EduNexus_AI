from typing import Any

from pydantic import BaseModel


class SchoolIntelligenceTrendResponse(BaseModel):
    success: bool
    snapshot_count: int
    status: str
    latest_snapshot: dict[str, Any] | None = None
    previous_snapshot: dict[str, Any] | None = None
    trends: dict[str, Any]