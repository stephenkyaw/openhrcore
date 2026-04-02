"""Response schema for candidate document uploads."""

from __future__ import annotations

from uuid import UUID

from pydantic import ConfigDict

from src.modules.recruitment.domain.models import DocumentType
from src.shared.common.schemas import TenantScopedMixin, TimestampMixin


class DocumentUploadResponse(TenantScopedMixin, TimestampMixin):
    candidate_id: UUID
    application_id: UUID | None
    document_type: DocumentType
    file_name: str
    file_key: str
    file_size_bytes: int
    mime_type: str
    uploaded_by: UUID | None

    model_config = ConfigDict(from_attributes=True)
