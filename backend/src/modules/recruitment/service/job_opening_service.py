"""Service layer for JobOpening business logic."""

from __future__ import annotations

from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.domain.models import JobOpening, JobOpeningStatus
from src.modules.recruitment.repository.job_opening import JobOpeningRepository
from src.modules.recruitment.schemas.job_opening import (
    JobOpeningCreate,
    JobOpeningUpdate,
)
from src.shared.common.schemas import PaginatedResponse, PaginationParams

logger = structlog.get_logger()


class JobOpeningService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = JobOpeningRepository(session)
        self._session = session

    async def create_job(
        self,
        tenant_id: UUID,
        user_id: UUID,
        data: JobOpeningCreate,
    ) -> JobOpening:
        """Create a new job opening owned by the requesting user."""
        job = await self._repo.create(
            tenant_id,
            created_by=user_id,
            **data.model_dump(),
        )
        logger.info(
            "job_opening.created",
            tenant_id=str(tenant_id),
            job_id=str(job.id),
        )
        return job

    async def get_job(self, tenant_id: UUID, job_id: UUID) -> JobOpening:
        """Return a single job opening with its application count."""
        return await self._repo.get_with_application_count(job_id, tenant_id)

    async def list_jobs(
        self,
        tenant_id: UUID,
        params: PaginationParams,
        status: JobOpeningStatus | None = None,
    ) -> PaginatedResponse[JobOpening]:
        """List job openings, optionally filtered by status."""
        if status is not None:
            return await self._repo.list_by_status(tenant_id, status, params)
        return await self._repo.list_all(tenant_id, params)

    async def update_job(
        self,
        tenant_id: UUID,
        job_id: UUID,
        data: JobOpeningUpdate,
    ) -> JobOpening:
        """Apply partial updates to an existing job opening."""
        job = await self._repo.get_by_id(job_id, tenant_id)
        updated = await self._repo.update(
            job,
            **data.model_dump(exclude_unset=True),
        )
        logger.info(
            "job_opening.updated",
            tenant_id=str(tenant_id),
            job_id=str(job_id),
        )
        return updated
