"""Service layer for Application business logic."""

from __future__ import annotations

from collections import defaultdict
from typing import Any
from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.domain.models import Application
from src.modules.recruitment.repository.application import ApplicationRepository
from src.modules.recruitment.schemas.application import ApplicationCreate
from src.modules.workflow.service.pipeline_service import PipelineWorkflowService
from src.shared.common.exceptions import ConflictError
from src.shared.common.schemas import PaginatedResponse, PaginationParams

logger = structlog.get_logger()


class ApplicationService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = ApplicationRepository(session)
        self._session = session
        self._workflow = PipelineWorkflowService()

    async def create_application(
        self,
        tenant_id: UUID,
        data: ApplicationCreate,
    ) -> Application:
        """Create an application after checking for duplicates.

        When no ``pipeline_id`` is provided the tenant's default pipeline
        is assigned automatically.
        """
        is_dup = await self._repo.check_duplicate(
            tenant_id,
            data.job_opening_id,
            data.candidate_id,
        )
        if is_dup:
            raise ConflictError(
                "Candidate already has an application for this job opening",
            )

        application = await self._repo.create(
            tenant_id,
            **data.model_dump(),
        )

        if data.pipeline_id is None:
            await self._workflow.assign_default_pipeline(
                self._session,
                tenant_id,
                application.id,
            )

        logger.info(
            "application.created",
            tenant_id=str(tenant_id),
            application_id=str(application.id),
        )
        return await self._repo.get_with_details(application.id, tenant_id)

    async def get_application(
        self,
        tenant_id: UUID,
        application_id: UUID,
    ) -> Application:
        """Return a single application with candidate, job, and stage detail."""
        return await self._repo.get_with_details(application_id, tenant_id)

    async def list_applications(
        self,
        tenant_id: UUID,
        params: PaginationParams,
        job_opening_id: UUID | None = None,
    ) -> PaginatedResponse[Application]:
        """List applications, optionally scoped to a single job opening."""
        if job_opening_id is not None:
            return await self._repo.list_by_job(tenant_id, job_opening_id, params)
        return await self._repo.list_all(tenant_id, params)

    async def get_pipeline_board(
        self,
        tenant_id: UUID,
        pipeline_id: UUID,
    ) -> list[dict[str, Any]]:
        """Return all pipeline stages with their applications for Kanban display.

        Every stage is returned even if it has zero applications, so the
        frontend always renders a full set of columns.
        """
        from src.modules.recruitment.repository.pipeline import PipelineRepository
        from src.modules.recruitment.schemas.application import ApplicationResponse
        from src.modules.recruitment.schemas.pipeline import PipelineStageResponse

        pipeline_repo = PipelineRepository(self._session)
        pipeline = await pipeline_repo.get_with_stages(pipeline_id, tenant_id)
        stages_sorted = sorted(pipeline.stages, key=lambda s: s.sort_order)

        applications = await self._repo.list_by_pipeline_stage(
            tenant_id,
            pipeline_id,
        )

        grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for app in applications:
            if app.current_stage and app.current_stage.pipeline_stage:
                key = str(app.current_stage.pipeline_stage.id)
                grouped[key].append(
                    ApplicationResponse.model_validate(app).model_dump(mode="json"),
                )

        board: list[dict[str, Any]] = []
        for stage in stages_sorted:
            board.append({
                "stage": PipelineStageResponse.model_validate(stage).model_dump(mode="json"),
                "applications": grouped.get(str(stage.id), []),
            })
        return board
