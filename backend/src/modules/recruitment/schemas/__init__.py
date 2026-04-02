"""Recruitment module Pydantic schemas — public re-exports."""

from src.modules.recruitment.schemas.application import (
    ApplicationCreate,
    ApplicationCurrentStageResponse,
    ApplicationListResponse,
    ApplicationResponse,
    MoveStageRequest,
    StageTransitionResponse,
)
from src.modules.recruitment.schemas.candidate import (
    CandidateCreate,
    CandidateEmailResponse,
    CandidateEmailSchema,
    CandidatePhoneResponse,
    CandidatePhoneSchema,
    CandidateResponse,
    CandidateUpdate,
)
from src.modules.recruitment.schemas.document import DocumentUploadResponse
from src.modules.recruitment.schemas.job_opening import (
    JobOpeningCreate,
    JobOpeningListResponse,
    JobOpeningResponse,
    JobOpeningUpdate,
)
from src.modules.recruitment.schemas.note import NoteCreate, NoteResponse
from src.modules.recruitment.schemas.pipeline import (
    PipelineCreate,
    PipelineResponse,
    PipelineStageCreate,
    PipelineStageResponse,
)
from src.modules.recruitment.schemas.screening import (
    AIAnalysisRunResponse,
    ScoreBreakdownResponse,
    ScreeningResultResponse,
)

__all__ = [
    # Job Opening
    "JobOpeningCreate",
    "JobOpeningUpdate",
    "JobOpeningResponse",
    "JobOpeningListResponse",
    # Candidate
    "CandidateCreate",
    "CandidateUpdate",
    "CandidateResponse",
    "CandidateEmailSchema",
    "CandidatePhoneSchema",
    "CandidateEmailResponse",
    "CandidatePhoneResponse",
    # Application
    "ApplicationCreate",
    "ApplicationResponse",
    "ApplicationListResponse",
    "ApplicationCurrentStageResponse",
    "MoveStageRequest",
    "StageTransitionResponse",
    # Pipeline
    "PipelineCreate",
    "PipelineStageCreate",
    "PipelineResponse",
    "PipelineStageResponse",
    # Document
    "DocumentUploadResponse",
    # Note
    "NoteCreate",
    "NoteResponse",
    # Screening
    "ScreeningResultResponse",
    "ScoreBreakdownResponse",
    "AIAnalysisRunResponse",
]
