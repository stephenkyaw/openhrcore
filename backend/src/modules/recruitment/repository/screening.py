"""Repository for AI screening entities (analysis runs, results, breakdowns)."""

from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.recruitment.domain.models import (
    AIAnalysisRun,
    AIRunStatus,
    AIRunType,
    CandidateScreeningResult,
    CandidateScreeningScoreBreakdown,
)


class ScreeningRepository:
    """Manages AI screening analysis runs and their results.

    This repository does **not** extend ``BaseRepository`` because it
    orchestrates multiple model types rather than a single one.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # -- analysis runs --------------------------------------------------------

    async def create_analysis_run(
        self,
        tenant_id: UUID,
        *,
        application_id: UUID,
        run_type: AIRunType,
        ai_model: str,
        ai_provider: str,
    ) -> AIAnalysisRun:
        run = AIAnalysisRun(
            tenant_id=tenant_id,
            application_id=application_id,
            run_type=run_type,
            status=AIRunStatus.PENDING,
            ai_model=ai_model,
            ai_provider=ai_provider,
        )
        self._session.add(run)
        await self._session.flush()
        await self._session.refresh(run)
        return run

    async def update_analysis_run(
        self,
        run: AIAnalysisRun,
        **kwargs: Any,
    ) -> AIAnalysisRun:
        for key, value in kwargs.items():
            if hasattr(run, key):
                setattr(run, key, value)
        self._session.add(run)
        await self._session.flush()
        await self._session.refresh(run)
        return run

    # -- screening results ----------------------------------------------------

    async def save_screening_result(
        self,
        tenant_id: UUID,
        *,
        application_id: UUID,
        analysis_run_id: UUID,
        result_data: dict[str, Any],
    ) -> CandidateScreeningResult:
        """Persist a screening result together with its score breakdowns.

        ``result_data`` must include ``overall_score``, ``recommendation``,
        ``summary``, and may include ``strengths``, ``weaknesses``, and
        ``breakdowns`` (a list of dicts with ``criteria``, ``score``,
        ``max_score``, ``reason``).
        """
        breakdowns_data: list[dict[str, Any]] = result_data.pop("breakdowns", [])

        screening_result = CandidateScreeningResult(
            tenant_id=tenant_id,
            application_id=application_id,
            analysis_run_id=analysis_run_id,
            **result_data,
        )
        self._session.add(screening_result)
        await self._session.flush()

        for bd in breakdowns_data:
            breakdown = CandidateScreeningScoreBreakdown(
                tenant_id=tenant_id,
                screening_result_id=screening_result.id,
                criteria=bd["criteria"],
                score=bd["score"],
                max_score=bd["max_score"],
                reason=bd["reason"],
            )
            self._session.add(breakdown)

        await self._session.flush()
        await self._session.refresh(screening_result)
        return screening_result

    async def get_result_by_application(
        self,
        tenant_id: UUID,
        application_id: UUID,
    ) -> CandidateScreeningResult | None:
        """Return the screening result for an application with breakdowns."""
        query = (
            select(CandidateScreeningResult)
            .where(
                CandidateScreeningResult.tenant_id == tenant_id,
                CandidateScreeningResult.application_id == application_id,
            )
            .options(
                selectinload(CandidateScreeningResult.breakdowns),
                selectinload(CandidateScreeningResult.analysis_run),
            )
        )
        result = await self._session.execute(query)
        return result.scalars().first()
