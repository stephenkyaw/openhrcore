"""Recruitment module – repository layer."""

from .application import ApplicationRepository
from .base import BaseRepository
from .candidate import CandidateRepository
from .document import DocumentRepository
from .job_opening import JobOpeningRepository
from .note import NoteRepository
from .pipeline import PipelineRepository
from .screening import ScreeningRepository
from .stage_transition import StageTransitionRepository

__all__ = [
    "ApplicationRepository",
    "BaseRepository",
    "CandidateRepository",
    "DocumentRepository",
    "JobOpeningRepository",
    "NoteRepository",
    "PipelineRepository",
    "ScreeningRepository",
    "StageTransitionRepository",
]
