"""Pydantic models for AI screening input and structured output."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ScreeningInput(BaseModel):
    """Data sent to the AI engine for CV screening."""

    job_title: str
    job_description: str
    job_requirements: str
    cv_text: str


class ScoreBreakdownItem(BaseModel):
    """A single scoring criterion within the AI evaluation."""

    criteria: str
    score: float = Field(ge=0, le=20)
    max_score: float = Field(ge=0, le=20)
    reason: str


class ScreeningOutput(BaseModel):
    """Structured response from the AI screening engine."""

    score: float = Field(ge=0, le=100)
    recommendation: str = Field(pattern=r"^(shortlist|review|reject)$")
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    score_breakdown: list[ScoreBreakdownItem]
