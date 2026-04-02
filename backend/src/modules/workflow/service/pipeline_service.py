"""Pipeline workflow service — manages stage transitions and pipeline assignment."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.recruitment.domain.models import (
    Application,
    ApplicationCurrentStage,
    ApplicationStageTransition,
    Pipeline,
    PipelineStage,
)

logger = structlog.get_logger()


class PipelineWorkflowService:
    """Handles pipeline stage transitions with validation and audit trail."""

    async def move_stage(
        self,
        session: AsyncSession,
        tenant_id: UUID,
        user_id: UUID,
        application_id: UUID,
        to_stage_id: UUID,
        notes: str | None = None,
    ) -> ApplicationStageTransition:
        """Transition an application to a new pipeline stage.

        Validates that the target stage belongs to the application's assigned
        pipeline, records the transition, and updates the current-stage pointer.
        """
        log = logger.bind(
            tenant_id=str(tenant_id),
            application_id=str(application_id),
            to_stage_id=str(to_stage_id),
        )

        application = await self._load_application(session, tenant_id, application_id)

        if application.pipeline_id is None:
            msg = f"Application {application_id} has no pipeline assigned"
            raise ValueError(msg)

        to_stage = await self._validate_stage_belongs_to_pipeline(
            session, application.pipeline_id, to_stage_id,
        )

        from_stage_id: UUID | None = None
        if application.current_stage is not None:
            from_stage_id = application.current_stage.pipeline_stage_id

        transition = ApplicationStageTransition(
            tenant_id=tenant_id,
            application_id=application_id,
            from_stage_id=from_stage_id,
            to_stage_id=to_stage_id,
            transitioned_at=datetime.now(timezone.utc),
            transitioned_by=user_id,
            notes=notes,
        )
        session.add(transition)

        if application.current_stage is not None:
            application.current_stage.pipeline_stage_id = to_stage_id
            application.current_stage.entered_at = datetime.now(timezone.utc)
        else:
            current_stage = ApplicationCurrentStage(
                tenant_id=tenant_id,
                application_id=application_id,
                pipeline_stage_id=to_stage_id,
                entered_at=datetime.now(timezone.utc),
            )
            session.add(current_stage)

        await session.flush()

        log.info(
            "workflow.stage_moved",
            from_stage_id=str(from_stage_id) if from_stage_id else None,
            to_stage=to_stage.name,
        )
        return transition

    async def assign_default_pipeline(
        self,
        session: AsyncSession,
        tenant_id: UUID,
        application_id: UUID,
    ) -> Pipeline:
        """Assign the tenant's default pipeline and set the first stage.

        The first stage is determined by the lowest ``sort_order`` value.
        """
        log = logger.bind(
            tenant_id=str(tenant_id),
            application_id=str(application_id),
        )

        pipeline = await self._find_default_pipeline(session, tenant_id)

        application = await self._load_application(session, tenant_id, application_id)
        application.pipeline_id = pipeline.id

        if not pipeline.stages:
            msg = f"Default pipeline {pipeline.id} has no stages"
            raise ValueError(msg)

        first_stage = pipeline.stages[0]

        if application.current_stage is not None:
            application.current_stage.pipeline_stage_id = first_stage.id
            application.current_stage.entered_at = datetime.now(timezone.utc)
        else:
            current_stage = ApplicationCurrentStage(
                tenant_id=tenant_id,
                application_id=application_id,
                pipeline_stage_id=first_stage.id,
                entered_at=datetime.now(timezone.utc),
            )
            session.add(current_stage)

        await session.flush()

        log.info(
            "workflow.default_pipeline_assigned",
            pipeline_id=str(pipeline.id),
            first_stage=first_stage.name,
        )
        return pipeline

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _load_application(
        self,
        session: AsyncSession,
        tenant_id: UUID,
        application_id: UUID,
    ) -> Application:
        stmt = (
            select(Application)
            .options(selectinload(Application.current_stage))
            .where(Application.id == application_id, Application.tenant_id == tenant_id)
        )
        result = await session.execute(stmt)
        application = result.scalar_one_or_none()
        if application is None:
            msg = f"Application {application_id} not found for tenant {tenant_id}"
            raise LookupError(msg)
        return application

    async def _validate_stage_belongs_to_pipeline(
        self,
        session: AsyncSession,
        pipeline_id: UUID,
        stage_id: UUID,
    ) -> PipelineStage:
        stmt = select(PipelineStage).where(
            PipelineStage.id == stage_id,
            PipelineStage.pipeline_id == pipeline_id,
        )
        result = await session.execute(stmt)
        stage = result.scalar_one_or_none()
        if stage is None:
            msg = (
                f"Stage {stage_id} does not belong to pipeline {pipeline_id}"
            )
            raise ValueError(msg)
        return stage

    async def _find_default_pipeline(
        self,
        session: AsyncSession,
        tenant_id: UUID,
    ) -> Pipeline:
        stmt = (
            select(Pipeline)
            .options(selectinload(Pipeline.stages))
            .where(Pipeline.tenant_id == tenant_id, Pipeline.is_default.is_(True))
        )
        result = await session.execute(stmt)
        pipeline = result.scalar_one_or_none()
        if pipeline is None:
            msg = f"No default pipeline found for tenant {tenant_id}"
            raise LookupError(msg)
        return pipeline
