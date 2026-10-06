from typing import Optional

from pydantic import BaseModel, Field


class SearchParams(BaseModel):
    search: Optional[str] = Field(
        default=None,
        max_length=100
    )

    sort_by: Optional[str] = Field(
        default=None,
        max_length=50
    )

    sort_order: str = Field(
        default="asc",
        pattern="^(asc|desc)$"
    )

    status: Optional[str] = Field(
        default=None,
        max_length=50
    )

    page: int = Field(
        default=1,
        ge=1
    )

    page_size: int = Field(
        default=25,
        ge=1,
        le=100
    )

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size