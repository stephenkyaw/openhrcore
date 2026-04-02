"""Common Pydantic schemas reused across the application."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Query parameters for paginated list endpoints."""

    page: int = Field(default=1, ge=1, description="1-based page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    """Envelope for paginated query results."""

    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


class ErrorResponse(BaseModel):
    """Standard error response body returned by exception handlers."""

    detail: str
    code: str | None = None


class TimestampMixin(BaseModel):
    """Read-only timestamp fields included in most response schemas."""

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TenantScopedMixin(BaseModel):
    """Fields present on every tenant-scoped resource."""

    id: uuid.UUID
    tenant_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class SuccessResponse(BaseModel):
    """Generic acknowledgement response."""

    ok: bool = True
    message: str = "Operation completed successfully"
