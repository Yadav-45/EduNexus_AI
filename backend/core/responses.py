from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class PaginationMeta(BaseModel):
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    total: int = Field(ge=0)
    total_pages: int = Field(ge=0)


class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    pagination: PaginationMeta


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None