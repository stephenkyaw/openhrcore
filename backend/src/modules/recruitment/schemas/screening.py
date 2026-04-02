"""Response schemas for AI screening results and analysis runs."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from src.modules.recruitment.domain.models import (
    AIRunStatus,
    AIRunType,
    ScreeningRecommendation,
)


class ScoreBreakdownResponse(BaseModel):
    id: UUID
    criteria: str
    score: Decimal
    max_score: Decimal
    reason: str

    model_config = ConfigDict(from_attributes=True)


class AIAnalysisRunResponse(BaseModel):
    id: UUID
    application_id: UUID
    run_type: AIRunType
    status: AIRunStatus
    started_at: datetime | None
    completed_at: datetime | None
    error_message: str | None
    ai_model: str
    ai_provider: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScreeningResultResponse(BaseModel):
    id: UUID
    application_id: UUID
    overall_score: Decimal
    recommendation: ScreeningRecommendation
    summary: str
    strengths: list[str] = []
    weaknesses: list[str] = []
    breakdowns: list[ScoreBreakdownResponse] = []
    analysis_run: AIAnalysisRunResponse | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
