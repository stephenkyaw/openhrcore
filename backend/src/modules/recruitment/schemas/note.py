"""Request / response schemas for recruitment notes."""

from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict

from src.shared.common.schemas import TenantScopedMixin, TimestampMixin


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------


class NoteCreate(BaseModel):
    content: str
    is_private: bool = False


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class NoteResponse(TenantScopedMixin, TimestampMixin):
    application_id: UUID
    author_id: UUID | None
    content: str
    is_private: bool
    author_name: str | None = None

    model_config = ConfigDict(from_attributes=True)
