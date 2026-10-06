from typing import Any, Optional

from pydantic import BaseModel


class SchoolIntelligenceFeaturesResponse(BaseModel):
    success: bool
    snapshot_count: int
    latest: Optional[dict[str, Any]]
    previous: Optional[dict[str, Any]]
    trends: dict[str, Any]
    ml_features: dict[str, Any]