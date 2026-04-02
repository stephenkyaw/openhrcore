"""Repository for JobOpening entities."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.domain.models import (
    Application,
    JobOpening,
    JobOpeningStatus,
)
from src.shared.common.exceptions import NotFoundError
from src.shared.common.pagination import paginate
from src.shared.common.schemas import PaginatedResponse, PaginationParams

from .base import BaseRepository


class JobOpeningRepository(BaseRepository[JobOpening]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, JobOpening)

    async def list_by_status(
        self,
        tenant_id: UUID,
        status: JobOpeningStatus,
        params: PaginationParams,
    ) -> PaginatedResponse[JobOpening]:
        query = (
            self._base_query(tenant_id)
            .where(JobOpening.status == status)
            .order_by(JobOpening.created_at.desc())
        )
        return await paginate(self._session, query, params)

    async def get_with_application_count(
        self,
        id: UUID,
        tenant_id: UUID,
    ) -> JobOpening:
        """Return a job opening with the total number of linked applications.

        The count is attached as ``application_count`` on the returned object.
        Raises ``NotFoundError`` if the job opening does not exist.
        """
        subq = (
            select(func.count(Application.id))
            .where(
                Application.job_opening_id == JobOpening.id,
                Application.tenant_id == tenant_id,
            )
            .correlate(JobOpening)
            .scalar_subquery()
            .label("application_count")
        )

        query = (
            select(JobOpening, subq)
            .where(JobOpening.tenant_id == tenant_id, JobOpening.id == id)
        )
        row = (await self._session.execute(query)).first()
        if row is None:
            raise NotFoundError("JobOpening", id)

        job_opening: JobOpening = row[0]
        job_opening.application_count = row[1] or 0  # type: ignore[attr-defined]
        return job_opening
