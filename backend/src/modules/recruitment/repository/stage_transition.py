"""Repository for application stage transitions and current-stage tracking."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.modules.recruitment.domain.models import (
    ApplicationCurrentStage,
    ApplicationStageTransition,
)
from src.shared.common.exceptions import NotFoundError


class StageTransitionRepository:
    """Manages stage transitions and the denormalised current-stage record.

    Like ``ScreeningRepository`` this class operates on multiple model types
    and therefore does not extend ``BaseRepository``.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_transition(
        self,
        tenant_id: UUID,
        *,
        application_id: UUID,
        from_stage_id: UUID | None,
        to_stage_id: UUID,
        transitioned_by: UUID | None = None,
        notes: str | None = None,
    ) -> ApplicationStageTransition:
        transition = ApplicationStageTransition(
            tenant_id=tenant_id,
            application_id=application_id,
            from_stage_id=from_stage_id,
            to_stage_id=to_stage_id,
            transitioned_by=transitioned_by,
            notes=notes,
        )
        self._session.add(transition)
        await self._session.flush()
        await self._session.refresh(transition)
        return transition

    async def list_by_application(
        self,
        tenant_id: UUID,
        application_id: UUID,
    ) -> list[ApplicationStageTransition]:
        query = (
            select(ApplicationStageTransition)
            .where(
                ApplicationStageTransition.tenant_id == tenant_id,
                ApplicationStageTransition.application_id == application_id,
            )
            .options(
                joinedload(ApplicationStageTransition.from_stage),
                joinedload(ApplicationStageTransition.to_stage),
                joinedload(ApplicationStageTransition.transitioned_by_user),
            )
            .order_by(ApplicationStageTransition.transitioned_at.asc())
        )
        result = await self._session.execute(query)
        return list(result.scalars().unique().all())

    async def update_current_stage(
        self,
        tenant_id: UUID,
        application_id: UUID,
        stage_id: UUID,
    ) -> ApplicationCurrentStage:
        """Create or update the current-stage pointer for an application."""
        query = select(ApplicationCurrentStage).where(
            ApplicationCurrentStage.tenant_id == tenant_id,
            ApplicationCurrentStage.application_id == application_id,
        )
        result = await self._session.execute(query)
        current = result.scalars().first()

        if current is not None:
            current.pipeline_stage_id = stage_id
            self._session.add(current)
        else:
            current = ApplicationCurrentStage(
                tenant_id=tenant_id,
                application_id=application_id,
                pipeline_stage_id=stage_id,
            )
            self._session.add(current)

        await self._session.flush()
        await self._session.refresh(current)
        return current
