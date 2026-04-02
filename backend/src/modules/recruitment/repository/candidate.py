"""Repository for Candidate entities."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.recruitment.domain.models import (
    Candidate,
    CandidateEmail,
    CandidatePhone,
)
from src.shared.common.exceptions import NotFoundError
from src.shared.common.pagination import paginate
from src.shared.common.schemas import PaginatedResponse, PaginationParams

from .base import BaseRepository


class CandidateRepository(BaseRepository[Candidate]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Candidate)

    def _contacts_options(self):
        return [selectinload(Candidate.emails), selectinload(Candidate.phones)]

    async def list_all(self, tenant_id, params, filters=None):
        query = self._base_query(tenant_id).options(*self._contacts_options())
        if filters:
            for col_name, value in filters.items():
                column = getattr(self._model, col_name, None)
                if column is not None:
                    query = query.where(column == value)
        query = query.order_by(self._model.created_at.desc())
        return await paginate(self._session, query, params)

    async def get_with_contacts(self, id: UUID, tenant_id: UUID) -> Candidate:
        """Fetch a candidate with emails and phones eagerly loaded."""
        query = (
            self._base_query(tenant_id)
            .where(Candidate.id == id)
            .options(
                selectinload(Candidate.emails),
                selectinload(Candidate.phones),
            )
        )
        result = await self._session.execute(query)
        candidate = result.scalars().first()
        if candidate is None:
            raise NotFoundError("Candidate", id)
        return candidate

    async def search(
        self,
        tenant_id: UUID,
        query_str: str,
        params: PaginationParams,
    ) -> PaginatedResponse[Candidate]:
        """Full-text-style search across candidate name and email addresses.

        Uses SQL ``ILIKE`` for broad compatibility; can be replaced with
        ``tsvector`` search when performance requires it.
        """
        pattern = f"%{query_str}%"
        email_subquery = (
            select(CandidateEmail.candidate_id)
            .where(
                CandidateEmail.tenant_id == tenant_id,
                CandidateEmail.email.ilike(pattern),
            )
            .distinct()
        )
        query = (
            self._base_query(tenant_id)
            .options(*self._contacts_options())
            .where(
                or_(
                    Candidate.first_name.ilike(pattern),
                    Candidate.last_name.ilike(pattern),
                    Candidate.id.in_(email_subquery),
                ),
            )
            .order_by(Candidate.created_at.desc())
        )
        return await paginate(self._session, query, params)
