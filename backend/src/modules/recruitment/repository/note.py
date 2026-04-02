"""Repository for RecruitmentNote entities."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.modules.recruitment.domain.models import RecruitmentNote
from src.shared.common.pagination import paginate
from src.shared.common.schemas import PaginatedResponse, PaginationParams

from .base import BaseRepository


class NoteRepository(BaseRepository[RecruitmentNote]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, RecruitmentNote)

    async def list_by_application(
        self,
        tenant_id: UUID,
        application_id: UUID,
        params: PaginationParams,
    ) -> PaginatedResponse[RecruitmentNote]:
        query = (
            self._base_query(tenant_id)
            .where(RecruitmentNote.application_id == application_id)
            .options(joinedload(RecruitmentNote.author))
            .order_by(RecruitmentNote.created_at.desc())
        )
        return await paginate(self._session, query, params)
