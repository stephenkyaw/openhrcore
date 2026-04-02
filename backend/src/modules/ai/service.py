"""AI Screening Service — orchestrates the CV screening workflow."""

from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.ai.engine.factory import get_ai_engine
from src.modules.ai.schemas.screening import ScreeningInput
from src.modules.recruitment.domain.models import (
    AIAnalysisRun,
    AIRunStatus,
    AIRunType,
    Application,
    CandidateDocument,
    CandidateScreeningResult,
    CandidateScreeningScoreBreakdown,
    DocumentType,
    ScreeningRecommendation,
)
from src.shared.storage.client import StorageClient

logger = structlog.get_logger()


class AIScreeningService:
    """Orchestrates AI-powered CV screening.

    AI results are stored as separate entities and never overwrite core
    recruitment data — the AI serves as decision support, not as the
    source of truth.
    """

    async def run_screening(
        self,
        session: AsyncSession,
        tenant_id: UUID,
        application_id: UUID,
    ) -> CandidateScreeningResult:
        """Execute the full screening pipeline for a single application.

        Steps:
        1. Load the application with its job opening and candidate.
        2. Find the candidate's CV document.
        3. Download the CV from object storage.
        4. Create an ``AIAnalysisRun`` record (status=processing).
        5. Call the AI engine.
        6. Persist ``CandidateScreeningResult`` and score breakdowns.
        7. Mark the run as completed.

        On failure the run is marked as *failed* and the error is recorded.
        """
        log = logger.bind(tenant_id=str(tenant_id), application_id=str(application_id))

        application = await self._load_application(session, tenant_id, application_id)
        cv_document = await self._find_cv_document(session, tenant_id, application)
        cv_bytes = self._download_cv(cv_document.file_key)
        cv_text = cv_bytes.decode("utf-8", errors="replace")

        engine = get_ai_engine()
        analysis_run = AIAnalysisRun(
            tenant_id=tenant_id,
            application_id=application_id,
            run_type=AIRunType.CV_SCREENING,
            status=AIRunStatus.PROCESSING,
            started_at=datetime.now(timezone.utc),
            ai_model=engine._model if hasattr(engine, "_model") else "unknown",
            ai_provider=engine.__class__.__name__,
        )
        session.add(analysis_run)
        await session.flush()

        log.info("ai.screening.started", analysis_run_id=str(analysis_run.id))

        try:
            job = application.job_opening
            requirements = (
                f"Department: {job.department or 'N/A'}, "
                f"Experience Level: {job.experience_level.value}, "
                f"Employment Type: {job.employment_type.value}"
            )

            screening_input = ScreeningInput(
                job_title=job.title,
                job_description=job.description or "",
                job_requirements=requirements,
                cv_text=cv_text,
            )

            output = await engine.screen_cv(screening_input)

            recommendation = ScreeningRecommendation(output.recommendation)

            screening_result = CandidateScreeningResult(
                tenant_id=tenant_id,
                application_id=application_id,
                analysis_run_id=analysis_run.id,
                overall_score=Decimal(str(output.score)),
                recommendation=recommendation,
                summary=output.summary,
                strengths=output.strengths,
                weaknesses=output.weaknesses,
            )
            session.add(screening_result)
            await session.flush()

            for item in output.score_breakdown:
                breakdown = CandidateScreeningScoreBreakdown(
                    tenant_id=tenant_id,
                    screening_result_id=screening_result.id,
                    criteria=item.criteria,
                    score=Decimal(str(item.score)),
                    max_score=Decimal(str(item.max_score)),
                    reason=item.reason,
                )
                session.add(breakdown)

            analysis_run.status = AIRunStatus.COMPLETED
            analysis_run.completed_at = datetime.now(timezone.utc)
            await session.flush()

            log.info(
                "ai.screening.completed",
                analysis_run_id=str(analysis_run.id),
                score=float(output.score),
                recommendation=output.recommendation,
            )

            return screening_result

        except Exception:
            analysis_run.status = AIRunStatus.FAILED
            analysis_run.completed_at = datetime.now(timezone.utc)
            analysis_run.error_message = _truncate_error()
            await session.flush()
            log.exception("ai.screening.failed", analysis_run_id=str(analysis_run.id))
            raise

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _load_application(
        self,
        session: AsyncSession,
        tenant_id: UUID,
        application_id: UUID,
    ) -> Application:
        stmt = (
            select(Application)
            .options(selectinload(Application.job_opening))
            .options(selectinload(Application.candidate))
            .where(Application.id == application_id, Application.tenant_id == tenant_id)
        )
        result = await session.execute(stmt)
        application = result.scalar_one_or_none()
        if application is None:
            msg = f"Application {application_id} not found for tenant {tenant_id}"
            raise LookupError(msg)
        return application

    async def _find_cv_document(
        self,
        session: AsyncSession,
        tenant_id: UUID,
        application: Application,
    ) -> CandidateDocument:
        """Find the CV attached to this application or candidate."""
        stmt = (
            select(CandidateDocument)
            .where(
                CandidateDocument.tenant_id == tenant_id,
                CandidateDocument.candidate_id == application.candidate_id,
                CandidateDocument.document_type == DocumentType.CV,
            )
            .order_by(CandidateDocument.created_at.desc())
            .limit(1)
        )
        result = await session.execute(stmt)
        doc = result.scalar_one_or_none()
        if doc is None:
            msg = (
                f"No CV document found for candidate {application.candidate_id} "
                f"(application {application.id})"
            )
            raise LookupError(msg)
        return doc

    def _download_cv(self, file_key: str) -> bytes:
        storage = StorageClient()
        return storage.download(file_key)


def _truncate_error(max_length: int = 2000) -> str:
    """Capture the current exception as a truncated string."""
    import traceback

    tb = traceback.format_exc()
    if len(tb) > max_length:
        return tb[:max_length] + "…[truncated]"
    return tb
