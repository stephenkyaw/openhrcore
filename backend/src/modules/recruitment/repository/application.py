"""Repository for Application entities."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import exists, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from src.modules.recruitment.domain.models import (
    Application,
    ApplicationCurrentStage,
    Candidate,
    PipelineStage,
)
from src.shared.common.exceptions import NotFoundError
from src.shared.common.pagination import paginate
from src.shared.common.schemas import PaginatedResponse, PaginationParams

from .base import BaseRepository


class ApplicationRepository(BaseRepository[Application]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Application)

    def _detail_options(self):
        return [
            selectinload(Application.candidate).selectinload(Candidate.emails),
            selectinload(Application.candidate).selectinload(Candidate.phones),
            selectinload(Application.job_opening),
            selectinload(Application.current_stage).selectinload(
                ApplicationCurrentStage.pipeline_stage,
            ),
        ]

    async def list_all(self, tenant_id, params, filters=None):
        query = self._base_query(tenant_id).options(*self._detail_options())
        if filters:
            for col_name, value in filters.items():
                column = getattr(self._model, col_name, None)
                if column is not None:
                    query = query.where(column == value)
        query = query.order_by(self._model.created_at.desc())
        return await paginate(self._session, query, params)

    async def get_with_details(self, id: UUID, tenant_id: UUID) -> Application:
        """Fetch an application with candidate, job opening, and current stage."""
        query = (
            self._base_query(tenant_id)
            .where(Application.id == id)
            .options(*self._detail_options())
        )
        result = await self._session.execute(query)
        application = result.scalars().first()
        if application is None:
            raise NotFoundError("Application", id)
        return application

    async def list_by_job(
        self,
        tenant_id: UUID,
        job_opening_id: UUID,
        params: PaginationParams,
    ) -> PaginatedResponse[Application]:
        query = (
            self._base_query(tenant_id)
            .where(Application.job_opening_id == job_opening_id)
            .options(*self._detail_options())
            .order_by(Application.applied_at.desc())
        )
        return await paginate(self._session, query, params)

    async def list_by_pipeline_stage(
        self,
        tenant_id: UUID,
        pipeline_id: UUID,
    ) -> list[Application]:
        """Return all applications for a pipeline, grouped by current stage.

        Results are ordered by the stage ``sort_order`` then by ``applied_at``
        so the caller can render a Kanban-style board directly.
        """
        query = (
            self._base_query(tenant_id)
            .where(Application.pipeline_id == pipeline_id)
            .join(Application.current_stage)
            .join(ApplicationCurrentStage.pipeline_stage)
            .options(*self._detail_options())
            .order_by(
                PipelineStage.sort_order,
                Application.applied_at.desc(),
            )
        )
        result = await self._session.execute(query)
        return list(result.scalars().unique().all())

    async def check_duplicate(
        self,
        tenant_id: UUID,
        job_opening_id: UUID,
        candidate_id: UUID,
    ) -> bool:
        """Return ``True`` if the candidate already has an application for the job."""
        stmt = select(
            exists().where(
                Application.tenant_id == tenant_id,
                Application.job_opening_id == job_opening_id,
                Application.candidate_id == candidate_id,
            ),
        )
        result = await self._session.execute(stmt)
        return bool(result.scalar())
