"""Service layer for document (CV) uploads."""

from __future__ import annotations

from uuid import UUID

import structlog
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.domain.models import CandidateDocument, DocumentType
from src.modules.recruitment.repository.document import DocumentRepository
from src.shared.common.exceptions import ValidationError
from src.shared.storage.client import StorageClient

logger = structlog.get_logger()

_ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

_MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class DocumentService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = DocumentRepository(session)
        self._session = session
        self._storage = StorageClient()

    async def upload_cv(
        self,
        tenant_id: UUID,
        user_id: UUID,
        candidate_id: UUID,
        application_id: UUID | None,
        file: UploadFile,
    ) -> CandidateDocument:
        """Upload a CV file to object storage and persist the metadata record."""
        content_type = file.content_type or "application/octet-stream"
        if content_type not in _ALLOWED_MIME_TYPES:
            raise ValidationError(
                f"Unsupported file type: {content_type}. "
                f"Allowed: {', '.join(sorted(_ALLOWED_MIME_TYPES))}",
            )

        data = await file.read()
        if len(data) > _MAX_FILE_SIZE:
            raise ValidationError(
                f"File exceeds maximum size of {_MAX_FILE_SIZE // (1024 * 1024)} MB",
            )

        prefix = f"tenants/{tenant_id}/candidates/{candidate_id}/cv"
        file_key = self._storage.upload(
            data,
            content_type=content_type,
            prefix=prefix,
        )

        document = await self._repo.create(
            tenant_id,
            candidate_id=candidate_id,
            application_id=application_id,
            document_type=DocumentType.CV,
            file_name=file.filename or "cv",
            file_key=file_key,
            file_size_bytes=len(data),
            mime_type=content_type,
            uploaded_by=user_id,
        )

        logger.info(
            "document.cv_uploaded",
            tenant_id=str(tenant_id),
            candidate_id=str(candidate_id),
            document_id=str(document.id),
        )
        return document
