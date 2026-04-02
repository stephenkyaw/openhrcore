"""Request / response schemas for the Job Opening resource."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from src.modules.recruitment.domain.models import (
    EmploymentType,
    ExperienceLevel,
    JobOpeningStatus,
)
from src.shared.common.schemas import (
    PaginatedResponse,
    TenantScopedMixin,
    TimestampMixin,
)


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------


class JobOpeningCreate(BaseModel):
    title: str
    description: str | None = None
    department: str | None = None
    location: str | None = None
    employment_type: EmploymentType
    experience_level: ExperienceLevel
    salary_min: Decimal | None = None
    salary_max: Decimal | None = None
    currency: str | None = Field(default=None, max_length=3)


class JobOpeningUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    department: str | None = None
    location: str | None = None
    employment_type: EmploymentType | None = None
    experience_level: ExperienceLevel | None = None
    salary_min: Decimal | None = None
    salary_max: Decimal | None = None
    currency: str | None = Field(default=None, max_length=3)
    status: JobOpeningStatus | None = None


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class JobOpeningResponse(TenantScopedMixin, TimestampMixin):
    title: str
    description: str | None
    department: str | None
    location: str | None
    employment_type: EmploymentType
    experience_level: ExperienceLevel
    salary_min: Decimal | None
    salary_max: Decimal | None
    currency: str | None
    status: JobOpeningStatus
    published_at: datetime | None
    closed_at: datetime | None
    created_by: UUID | None
    application_count: int | None = None

    model_config = ConfigDict(from_attributes=True)


JobOpeningListResponse = PaginatedResponse[JobOpeningResponse]
