"""Request / response schemas for Candidate, CandidateEmail, and CandidatePhone."""

from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr

from src.modules.recruitment.domain.models import (
    CandidateSource,
    EmailLabel,
    PhoneLabel,
)
from src.shared.common.schemas import TenantScopedMixin, TimestampMixin


# ---------------------------------------------------------------------------
# Nested input schemas (used inside CandidateCreate)
# ---------------------------------------------------------------------------


class CandidateEmailSchema(BaseModel):
    email: EmailStr
    is_primary: bool = False
    label: EmailLabel = EmailLabel.PERSONAL


class CandidatePhoneSchema(BaseModel):
    phone: str
    is_primary: bool = False
    label: PhoneLabel = PhoneLabel.MOBILE


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------


class CandidateCreate(BaseModel):
    first_name: str
    last_name: str
    headline: str | None = None
    summary: str | None = None
    source: CandidateSource = CandidateSource.DIRECT
    source_detail: str | None = None
    emails: list[CandidateEmailSchema] = []
    phones: list[CandidatePhoneSchema] = []


class CandidateUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    headline: str | None = None
    summary: str | None = None
    source: CandidateSource | None = None
    source_detail: str | None = None


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class CandidateEmailResponse(TenantScopedMixin, TimestampMixin):
    candidate_id: UUID
    email: str
    is_primary: bool
    label: EmailLabel

    model_config = ConfigDict(from_attributes=True)


class CandidatePhoneResponse(TenantScopedMixin, TimestampMixin):
    candidate_id: UUID
    phone: str
    is_primary: bool
    label: PhoneLabel

    model_config = ConfigDict(from_attributes=True)


class CandidateResponse(TenantScopedMixin, TimestampMixin):
    first_name: str
    last_name: str
    headline: str | None
    summary: str | None
    source: CandidateSource
    source_detail: str | None
    emails: list[CandidateEmailResponse] = []
    phones: list[CandidatePhoneResponse] = []

    model_config = ConfigDict(from_attributes=True)
