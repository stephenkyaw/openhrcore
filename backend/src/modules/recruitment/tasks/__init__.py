"""Recruitment background tasks (Dramatiq actors)."""

from src.modules.recruitment.tasks.screening_task import run_cv_screening

__all__ = ["run_cv_screening"]
