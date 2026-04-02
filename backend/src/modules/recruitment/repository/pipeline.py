"""Repository for Pipeline and PipelineStage entities."""

from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.recruitment.domain.models import Pipeline, PipelineStage
from src.shared.common.exceptions import NotFoundError

from .base import BaseRepository


class PipelineRepository(BaseRepository[Pipeline]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Pipeline)

    async def list_with_stages(self, tenant_id: UUID) -> list[Pipeline]:
        """Return all pipelines for the tenant, with stages eagerly loaded."""
        query = (
            self._base_query(tenant_id)
            .options(selectinload(Pipeline.stages))
            .order_by(Pipeline.is_default.desc(), Pipeline.created_at.desc())
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def get_default(self, tenant_id: UUID) -> Pipeline | None:
        """Return the tenant's default pipeline, or ``None`` if unset."""
        query = (
            self._base_query(tenant_id)
            .where(Pipeline.is_default.is_(True))
            .options(selectinload(Pipeline.stages))
        )
        result = await self._session.execute(query)
        return result.scalars().first()

    async def get_with_stages(self, id: UUID, tenant_id: UUID) -> Pipeline:
        """Fetch a pipeline with its stages eagerly loaded and sorted."""
        query = (
            self._base_query(tenant_id)
            .where(Pipeline.id == id)
            .options(selectinload(Pipeline.stages))
        )
        result = await self._session.execute(query)
        pipeline = result.scalars().first()
        if pipeline is None:
            raise NotFoundError("Pipeline", id)
        return pipeline

    async def create_with_stages(
        self,
        tenant_id: UUID,
        *,
        name: str,
        is_default: bool = False,
        job_opening_id: UUID | None = None,
        stages_data: list[dict[str, Any]],
    ) -> Pipeline:
        """Atomically create a pipeline together with its stage rows.

        Each entry in *stages_data* should contain ``name``, ``stage_type``,
        and optionally ``sort_order``.
        """
        pipeline = Pipeline(
            tenant_id=tenant_id,
            name=name,
            is_default=is_default,
            job_opening_id=job_opening_id,
        )
        self._session.add(pipeline)
        await self._session.flush()

        for idx, stage_info in enumerate(stages_data):
            stage = PipelineStage(
                tenant_id=tenant_id,
                pipeline_id=pipeline.id,
                name=stage_info["name"],
                stage_type=stage_info["stage_type"],
                sort_order=stage_info.get("sort_order", idx),
            )
            self._session.add(stage)

        await self._session.flush()
        await self._session.refresh(pipeline)

        return await self.get_with_stages(pipeline.id, tenant_id)
