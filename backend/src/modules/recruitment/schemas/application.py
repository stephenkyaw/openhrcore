"""Request / response schemas for Application and stage transitions."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from src.modules.recruitment.domain.models import ApplicationStatus, StageType
from src.modules.recruitment.schemas.candidate import CandidateResponse
from src.modules.recruitment.schemas.job_opening import JobOpeningResponse
from src.shared.common.schemas import PaginatedResponse, TenantScopedMixin, TimestampMixin


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------


class ApplicationCreate(BaseModel):
    job_opening_id: UUID
    candidate_id: UUID
    pipeline_id: UUID | None = None


class MoveStageRequest(BaseModel):
    to_stage_id: UUID
    notes: str | None = None


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class ApplicationCurrentStageResponse(BaseModel):
    id: UUID
    pipeline_stage_id: UUID
    stage_name: str | None = None
    stage_type: StageType | None = None
    entered_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationResponse(TenantScopedMixin, TimestampMixin):
    job_opening_id: UUID
    candidate_id: UUID
    pipeline_id: UUID | None
    applied_at: datetime
    status: ApplicationStatus
    rejection_reason: str | None
    candidate: CandidateResponse | None = None
    job_opening: JobOpeningResponse | None = None
    current_stage: ApplicationCurrentStageResponse | None = None

    model_config = ConfigDict(from_attributes=True)


ApplicationListResponse = PaginatedResponse[ApplicationResponse]


class StageTransitionResponse(TenantScopedMixin, TimestampMixin):
    application_id: UUID
    from_stage_id: UUID | None
    to_stage_id: UUID
    from_stage_name: str | None = None
    to_stage_name: str | None = None
    transitioned_at: datetime
    transitioned_by: UUID | None
    notes: str | None

    model_config = ConfigDict(from_attributes=True)
