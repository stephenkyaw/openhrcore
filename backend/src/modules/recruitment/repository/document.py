"""Repository for CandidateDocument entities."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.domain.models import (
    CandidateDocument,
    DocumentType,
)
from src.shared.common.pagination import paginate
from src.shared.common.schemas import PaginatedResponse, PaginationParams

from .base import BaseRepository


class DocumentRepository(BaseRepository[CandidateDocument]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, CandidateDocument)

    async def list_by_candidate(
        self,
        tenant_id: UUID,
        candidate_id: UUID,
        params: PaginationParams,
    ) -> PaginatedResponse[CandidateDocument]:
        query = (
            self._base_query(tenant_id)
            .where(CandidateDocument.candidate_id == candidate_id)
            .order_by(CandidateDocument.created_at.desc())
        )
        return await paginate(self._session, query, params)

    async def get_cv_for_application(
        self,
        tenant_id: UUID,
        application_id: UUID,
    ) -> CandidateDocument | None:
        """Return the CV document linked to an application, if any."""
        query = (
            select(CandidateDocument)
            .where(
                CandidateDocument.tenant_id == tenant_id,
                CandidateDocument.application_id == application_id,
                CandidateDocument.document_type == DocumentType.CV,
            )
            .order_by(CandidateDocument.created_at.desc())
            .limit(1)
        )
        result = await self._session.execute(query)
        return result.scalars().first()
