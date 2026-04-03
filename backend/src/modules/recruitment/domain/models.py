"""SQLAlchemy domain models for the OpenHRCore Recruit module."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.shared.database.base import Base

# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    RECRUITER = "recruiter"
    HIRING_MANAGER = "hiring_manager"
    VIEWER = "viewer"


class EmploymentType(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"


class ExperienceLevel(str, enum.Enum):
    ENTRY = "entry"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"
    EXECUTIVE = "executive"


class JobOpeningStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    ON_HOLD = "on_hold"
    CLOSED = "closed"


class CandidateSource(str, enum.Enum):
    DIRECT = "direct"
    REFERRAL = "referral"
    LINKEDIN = "linkedin"
    JOB_BOARD = "job_board"
    AGENCY = "agency"
    OTHER = "other"


class EmailLabel(str, enum.Enum):
    PERSONAL = "personal"
    WORK = "work"
    OTHER = "other"


class PhoneLabel(str, enum.Enum):
    MOBILE = "mobile"
    HOME = "home"
    WORK = "work"
    OTHER = "other"


class StageType(str, enum.Enum):
    SOURCED = "sourced"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    HIRED = "hired"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ApplicationStatus(str, enum.Enum):
    ACTIVE = "active"
    HIRED = "hired"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class DocumentType(str, enum.Enum):
    CV = "cv"
    COVER_LETTER = "cover_letter"
    PORTFOLIO = "portfolio"
    OTHER = "other"


class AIRunType(str, enum.Enum):
    CV_SCREENING = "cv_screening"
    SCORING = "scoring"


class AIRunStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ScreeningRecommendation(str, enum.Enum):
    SHORTLIST = "shortlist"
    REVIEW = "review"
    REJECT = "reject"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class Role(Base):
    """Dynamic role definition — each tenant can create custom roles."""

    __tablename__ = "roles"
    __table_args__ = (
        UniqueConstraint("tenant_id", "name", name="uq_role_tenant_name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    permissions: Mapped[list[RolePermissionEntry]] = relationship(
        back_populates="role",
        cascade="all, delete-orphan",
    )


class RolePermissionEntry(Base):
    """Individual permission assigned to a role."""

    __tablename__ = "role_permissions"
    __table_args__ = (
        UniqueConstraint("role_id", "permission", name="uq_role_perm"),
        Index("ix_role_permissions_role", "role_id"),
    )

    role_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("roles.id", ondelete="CASCADE"),
        nullable=False,
    )
    permission: Mapped[str] = mapped_column(String(100), nullable=False)

    role: Mapped[Role] = relationship(back_populates="permissions")


class Tenant(Base):
    """Organisation tenant — the top-level isolation boundary."""

    __tablename__ = "tenants"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    domain: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true", nullable=False,
    )

    def __init__(self, **kwargs: Any) -> None:
        """Ensure *tenant_id* mirrors *id* for the tenant's own row."""
        if "id" not in kwargs:
            kwargs["id"] = uuid.uuid4()
        kwargs.setdefault("tenant_id", kwargs["id"])
        super().__init__(**kwargs)


class UserAccount(Base):
    __tablename__ = "user_accounts"
    __table_args__ = (
        UniqueConstraint(
            "tenant_id", "keycloak_user_id",
            name="uq_useraccount_tenant_keycloak",
        ),
        Index("ix_user_accounts_tenant_email", "tenant_id", "email"),
    )

    keycloak_user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), nullable=False,
    )
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true", nullable=False,
    )
    role: Mapped[UserRole] = mapped_column(String(50), nullable=False, default=UserRole.VIEWER)

    # --- relationships ---
    created_job_openings: Mapped[list[JobOpening]] = relationship(
        back_populates="creator",
    )
    authored_notes: Mapped[list[RecruitmentNote]] = relationship(
        back_populates="author",
    )
    performed_transitions: Mapped[list[ApplicationStageTransition]] = relationship(
        back_populates="transitioned_by_user",
        foreign_keys="[ApplicationStageTransition.transitioned_by]",
    )
    performed_activity_logs: Mapped[list[ActivityLog]] = relationship(
        back_populates="performed_by_user",
        foreign_keys="[ActivityLog.performed_by]",
    )


class JobOpening(Base):
    __tablename__ = "job_openings"
    __table_args__ = (
        Index("ix_job_openings_tenant_status", "tenant_id", "status"),
        Index("ix_job_openings_tenant_department", "tenant_id", "department"),
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    department: Mapped[str | None] = mapped_column(String(255))
    location: Mapped[str | None] = mapped_column(String(255))
    employment_type: Mapped[EmploymentType] = mapped_column(String(50), nullable=False)
    experience_level: Mapped[ExperienceLevel] = mapped_column(String(50), nullable=False)
    salary_min: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    salary_max: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    currency: Mapped[str | None] = mapped_column(String(3))
    status: Mapped[JobOpeningStatus] = mapped_column(
        String(50), nullable=False, default=JobOpeningStatus.DRAFT,
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("user_accounts.id", ondelete="SET NULL"),
    )

    # --- relationships ---
    creator: Mapped[UserAccount | None] = relationship(
        back_populates="created_job_openings",
    )
    applications: Mapped[list[Application]] = relationship(
        back_populates="job_opening",
    )
    pipelines: Mapped[list[Pipeline]] = relationship(back_populates="job_opening")


class Candidate(Base):
    __tablename__ = "candidates"
    __table_args__ = (
        Index("ix_candidates_tenant_source", "tenant_id", "source"),
    )

    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    last_name: Mapped[str] = mapped_column(String(255), nullable=False)
    headline: Mapped[str | None] = mapped_column(String(500))
    summary: Mapped[str | None] = mapped_column(Text)
    source: Mapped[CandidateSource] = mapped_column(
        String(50), nullable=False, default=CandidateSource.DIRECT,
    )
    source_detail: Mapped[str | None] = mapped_column(String(500))

    # --- relationships ---
    emails: Mapped[list[CandidateEmail]] = relationship(
        back_populates="candidate", cascade="all, delete-orphan",
    )
    phones: Mapped[list[CandidatePhone]] = relationship(
        back_populates="candidate", cascade="all, delete-orphan",
    )
    applications: Mapped[list[Application]] = relationship(
        back_populates="candidate",
    )
    documents: Mapped[list[CandidateDocument]] = relationship(
        back_populates="candidate",
        foreign_keys="[CandidateDocument.candidate_id]",
    )


class CandidateEmail(Base):
    __tablename__ = "candidate_emails"
    __table_args__ = (
        Index("ix_candidate_emails_tenant_candidate", "tenant_id", "candidate_id"),
    )

    candidate_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("candidates.id", ondelete="CASCADE"),
        nullable=False,
    )
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    label: Mapped[EmailLabel] = mapped_column(
        String(50), nullable=False, default=EmailLabel.PERSONAL,
    )

    # --- relationships ---
    candidate: Mapped[Candidate] = relationship(back_populates="emails")


class CandidatePhone(Base):
    __tablename__ = "candidate_phones"
    __table_args__ = (
        Index("ix_candidate_phones_tenant_candidate", "tenant_id", "candidate_id"),
    )

    candidate_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("candidates.id", ondelete="CASCADE"),
        nullable=False,
    )
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    label: Mapped[PhoneLabel] = mapped_column(
        String(50), nullable=False, default=PhoneLabel.MOBILE,
    )

    # --- relationships ---
    candidate: Mapped[Candidate] = relationship(back_populates="phones")


class Pipeline(Base):
    __tablename__ = "pipelines"
    __table_args__ = (
        Index("ix_pipelines_tenant_job_opening", "tenant_id", "job_opening_id"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    job_opening_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("job_openings.id", ondelete="CASCADE"),
    )

    # --- relationships ---
    job_opening: Mapped[JobOpening | None] = relationship(
        back_populates="pipelines",
    )
    stages: Mapped[list[PipelineStage]] = relationship(
        back_populates="pipeline",
        cascade="all, delete-orphan",
        order_by="PipelineStage.sort_order",
    )
    applications: Mapped[list[Application]] = relationship(
        back_populates="pipeline",
    )


class PipelineStage(Base):
    __tablename__ = "pipeline_stages"
    __table_args__ = (
        Index("ix_pipeline_stages_pipeline_sort", "pipeline_id", "sort_order"),
    )

    pipeline_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("pipelines.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    stage_type: Mapped[StageType] = mapped_column(String(50), nullable=False)

    # --- relationships ---
    pipeline: Mapped[Pipeline] = relationship(back_populates="stages")


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint(
            "tenant_id", "job_opening_id", "candidate_id",
            name="uq_application_tenant_job_candidate",
        ),
        Index("ix_applications_tenant_status", "tenant_id", "status"),
        Index("ix_applications_tenant_job", "tenant_id", "job_opening_id"),
        Index("ix_applications_tenant_candidate", "tenant_id", "candidate_id"),
    )

    job_opening_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("job_openings.id", ondelete="CASCADE"),
        nullable=False,
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("candidates.id", ondelete="CASCADE"),
        nullable=False,
    )
    pipeline_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("pipelines.id", ondelete="SET NULL"),
    )
    applied_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False,
    )
    status: Mapped[ApplicationStatus] = mapped_column(
        String(50), nullable=False, default=ApplicationStatus.ACTIVE,
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text)

    # --- relationships ---
    job_opening: Mapped[JobOpening] = relationship(back_populates="applications")
    candidate: Mapped[Candidate] = relationship(back_populates="applications")
    pipeline: Mapped[Pipeline | None] = relationship(back_populates="applications")
    current_stage: Mapped[ApplicationCurrentStage | None] = relationship(
        back_populates="application", uselist=False, cascade="all, delete-orphan",
    )
    stage_transitions: Mapped[list[ApplicationStageTransition]] = relationship(
        back_populates="application", cascade="all, delete-orphan",
    )
    documents: Mapped[list[CandidateDocument]] = relationship(
        back_populates="application",
        foreign_keys="[CandidateDocument.application_id]",
    )
    notes: Mapped[list[RecruitmentNote]] = relationship(
        back_populates="application", cascade="all, delete-orphan",
    )
    activity_logs: Mapped[list[ActivityLog]] = relationship(
        back_populates="application",
    )
    ai_analysis_runs: Mapped[list[AIAnalysisRun]] = relationship(
        back_populates="application", cascade="all, delete-orphan",
    )
    screening_result: Mapped[CandidateScreeningResult | None] = relationship(
        back_populates="application", uselist=False, cascade="all, delete-orphan",
    )


class ApplicationCurrentStage(Base):
    __tablename__ = "application_current_stages"

    application_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    pipeline_stage_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("pipeline_stages.id", ondelete="CASCADE"),
        nullable=False,
    )
    entered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False,
    )

    # --- relationships ---
    application: Mapped[Application] = relationship(back_populates="current_stage")
    pipeline_stage: Mapped[PipelineStage] = relationship()


class ApplicationStageTransition(Base):
    __tablename__ = "application_stage_transitions"
    __table_args__ = (
        Index("ix_stage_transitions_tenant_app", "tenant_id", "application_id"),
    )

    application_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
    )
    from_stage_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("pipeline_stages.id", ondelete="SET NULL"),
    )
    to_stage_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("pipeline_stages.id", ondelete="CASCADE"),
        nullable=False,
    )
    transitioned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False,
    )
    transitioned_by: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("user_accounts.id", ondelete="SET NULL"),
    )
    notes: Mapped[str | None] = mapped_column(Text)

    # --- relationships ---
    application: Mapped[Application] = relationship(
        back_populates="stage_transitions",
    )
    from_stage: Mapped[PipelineStage | None] = relationship(
        foreign_keys=[from_stage_id],
    )
    to_stage: Mapped[PipelineStage] = relationship(
        foreign_keys=[to_stage_id],
    )
    transitioned_by_user: Mapped[UserAccount | None] = relationship(
        back_populates="performed_transitions",
        foreign_keys=[transitioned_by],
    )


class CandidateDocument(Base):
    __tablename__ = "candidate_documents"
    __table_args__ = (
        Index("ix_candidate_docs_tenant_candidate", "tenant_id", "candidate_id"),
        Index("ix_candidate_docs_tenant_app", "tenant_id", "application_id"),
    )

    candidate_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("candidates.id", ondelete="CASCADE"),
        nullable=False,
    )
    application_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("applications.id", ondelete="SET NULL"),
    )
    document_type: Mapped[DocumentType] = mapped_column(String(50), nullable=False)
    file_name: Mapped[str] = mapped_column(String(500), nullable=False)
    file_key: Mapped[str] = mapped_column(String(1024), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(255), nullable=False)
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("user_accounts.id", ondelete="SET NULL"),
    )

    # --- relationships ---
    candidate: Mapped[Candidate] = relationship(
        back_populates="documents", foreign_keys=[candidate_id],
    )
    application: Mapped[Application | None] = relationship(
        back_populates="documents", foreign_keys=[application_id],
    )
    uploader: Mapped[UserAccount | None] = relationship()


class RecruitmentNote(Base):
    __tablename__ = "recruitment_notes"
    __table_args__ = (
        Index("ix_recruitment_notes_tenant_app", "tenant_id", "application_id"),
    )

    application_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
    )
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("user_accounts.id", ondelete="SET NULL"),
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # --- relationships ---
    application: Mapped[Application] = relationship(back_populates="notes")
    author: Mapped[UserAccount | None] = relationship(back_populates="authored_notes")


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    __table_args__ = (
        Index("ix_activity_logs_tenant_entity", "tenant_id", "entity_type", "entity_id"),
        Index("ix_activity_logs_tenant_app", "tenant_id", "application_id"),
    )

    application_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("applications.id", ondelete="SET NULL"),
    )
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    details: Mapped[dict | None] = mapped_column(JSONB)
    performed_by: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("user_accounts.id", ondelete="SET NULL"),
    )

    # --- relationships ---
    application: Mapped[Application | None] = relationship(
        back_populates="activity_logs",
    )
    performed_by_user: Mapped[UserAccount | None] = relationship(
        back_populates="performed_activity_logs",
        foreign_keys=[performed_by],
    )


class AIAnalysisRun(Base):
    __tablename__ = "ai_analysis_runs"
    __table_args__ = (
        Index("ix_ai_runs_tenant_app", "tenant_id", "application_id"),
    )

    application_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
    )
    run_type: Mapped[AIRunType] = mapped_column(String(50), nullable=False)
    status: Mapped[AIRunStatus] = mapped_column(
        String(50), nullable=False, default=AIRunStatus.PENDING,
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    error_message: Mapped[str | None] = mapped_column(Text)
    ai_model: Mapped[str] = mapped_column(String(100), nullable=False)
    ai_provider: Mapped[str] = mapped_column(String(100), nullable=False)

    # --- relationships ---
    application: Mapped[Application] = relationship(
        back_populates="ai_analysis_runs",
    )
    screening_result: Mapped[CandidateScreeningResult | None] = relationship(
        back_populates="analysis_run", uselist=False,
    )


class CandidateScreeningResult(Base):
    __tablename__ = "candidate_screening_results"

    application_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("ai_analysis_runs.id", ondelete="CASCADE"),
        nullable=False,
    )
    overall_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    recommendation: Mapped[ScreeningRecommendation] = mapped_column(String(50), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    strengths: Mapped[list | None] = mapped_column(JSONB)
    weaknesses: Mapped[list | None] = mapped_column(JSONB)

    # --- relationships ---
    application: Mapped[Application] = relationship(
        back_populates="screening_result",
    )
    analysis_run: Mapped[AIAnalysisRun] = relationship(
        back_populates="screening_result",
    )
    breakdowns: Mapped[list[CandidateScreeningScoreBreakdown]] = relationship(
        back_populates="screening_result", cascade="all, delete-orphan",
    )


class CandidateScreeningScoreBreakdown(Base):
    __tablename__ = "candidate_screening_score_breakdowns"
    __table_args__ = (
        Index("ix_score_breakdowns_result", "tenant_id", "screening_result_id"),
    )

    screening_result_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("candidate_screening_results.id", ondelete="CASCADE"),
        nullable=False,
    )
    criteria: Mapped[str] = mapped_column(String(255), nullable=False)
    score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    max_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)

    # --- relationships ---
    screening_result: Mapped[CandidateScreeningResult] = relationship(
        back_populates="breakdowns",
    )
