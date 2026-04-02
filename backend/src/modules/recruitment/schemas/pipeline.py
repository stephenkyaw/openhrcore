"""Request / response schemas for Pipeline and PipelineStage."""

from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict

from src.modules.recruitment.domain.models import StageType
from src.shared.common.schemas import TenantScopedMixin, TimestampMixin


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------


class PipelineStageCreate(BaseModel):
    name: str
    sort_order: int
    stage_type: StageType


class PipelineCreate(BaseModel):
    name: str
    is_default: bool = False
    job_opening_id: UUID | None = None
    stages: list[PipelineStageCreate] = []


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class PipelineStageResponse(TenantScopedMixin, TimestampMixin):
    pipeline_id: UUID
    name: str
    sort_order: int
    stage_type: StageType

    model_config = ConfigDict(from_attributes=True)


class PipelineResponse(TenantScopedMixin, TimestampMixin):
    name: str
    is_default: bool
    job_opening_id: UUID | None
    stages: list[PipelineStageResponse] = []

    model_config = ConfigDict(from_attributes=True)
