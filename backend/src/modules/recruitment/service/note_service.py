"""Service layer for recruitment notes."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.domain.models import RecruitmentNote
from src.modules.recruitment.repository.note import NoteRepository
from src.modules.recruitment.schemas.note import NoteCreate
from src.shared.common.schemas import PaginatedResponse, PaginationParams


class NoteService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = NoteRepository(session)

    async def create_note(
        self,
        tenant_id: UUID,
        user_id: UUID,
        application_id: UUID,
        data: NoteCreate,
    ) -> RecruitmentNote:
        """Create a note attached to an application."""
        return await self._repo.create(
            tenant_id,
            application_id=application_id,
            author_id=user_id,
            **data.model_dump(),
        )

    async def list_notes(
        self,
        tenant_id: UUID,
        application_id: UUID,
        params: PaginationParams,
    ) -> PaginatedResponse[RecruitmentNote]:
        """Return paginated notes for an application, newest first."""
        return await self._repo.list_by_application(
            tenant_id,
            application_id,
            params,
        )
