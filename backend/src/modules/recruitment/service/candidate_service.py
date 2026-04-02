"""Service layer for Candidate business logic."""

from __future__ import annotations

from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.domain.models import (
    Candidate,
    CandidateEmail,
    CandidatePhone,
)
from src.modules.recruitment.repository.candidate import CandidateRepository
from src.modules.recruitment.schemas.candidate import (
    CandidateCreate,
    CandidateUpdate,
)
from src.shared.common.schemas import PaginatedResponse, PaginationParams

logger = structlog.get_logger()


class CandidateService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = CandidateRepository(session)
        self._session = session

    async def create_candidate(
        self,
        tenant_id: UUID,
        data: CandidateCreate,
    ) -> Candidate:
        """Create a candidate with optional email/phone contacts."""
        payload = data.model_dump(exclude={"emails", "phones"})
        candidate = await self._repo.create(tenant_id, **payload)

        for email_data in data.emails:
            email = CandidateEmail(
                tenant_id=tenant_id,
                candidate_id=candidate.id,
                **email_data.model_dump(),
            )
            self._session.add(email)

        for phone_data in data.phones:
            phone = CandidatePhone(
                tenant_id=tenant_id,
                candidate_id=candidate.id,
                **phone_data.model_dump(),
            )
            self._session.add(phone)

        await self._session.flush()
        return await self._repo.get_with_contacts(candidate.id, tenant_id)

    async def get_candidate(
        self,
        tenant_id: UUID,
        candidate_id: UUID,
    ) -> Candidate:
        """Return a candidate with eagerly loaded contacts."""
        return await self._repo.get_with_contacts(candidate_id, tenant_id)

    async def list_candidates(
        self,
        tenant_id: UUID,
        params: PaginationParams,
        search: str | None = None,
    ) -> PaginatedResponse[Candidate]:
        """List candidates with optional text search across name and email."""
        if search:
            return await self._repo.search(tenant_id, search, params)
        return await self._repo.list_all(tenant_id, params)

    async def update_candidate(
        self,
        tenant_id: UUID,
        candidate_id: UUID,
        data: CandidateUpdate,
    ) -> Candidate:
        """Apply partial updates to an existing candidate."""
        candidate = await self._repo.get_by_id(candidate_id, tenant_id)
        updated = await self._repo.update(
            candidate,
            **data.model_dump(exclude_unset=True),
        )
        logger.info(
            "candidate.updated",
            tenant_id=str(tenant_id),
            candidate_id=str(candidate_id),
        )
        return updated
