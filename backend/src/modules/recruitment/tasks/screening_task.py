"""Dramatiq background task for AI-powered CV screening."""

from __future__ import annotations

import asyncio
from uuid import UUID

import dramatiq
import structlog

from src.worker import broker  # noqa: F401 — ensure broker is initialised

logger = structlog.get_logger()


def _run_async(coro):  # type: ignore[no-untyped-def]
    """Bridge sync Dramatiq actors to async service code.

    Creates a fresh event loop per invocation so there is no conflict
    with the outer sync thread that Dramatiq workers use.
    """
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@dramatiq.actor(max_retries=3, min_backoff=10_000, time_limit=300_000, queue_name="screening")  # type: ignore[misc]
def run_cv_screening(tenant_id: str, application_id: str) -> None:
    """Screen a candidate CV against job requirements using AI.

    This task is **idempotent**: if a ``CandidateScreeningResult`` already
    exists for the given application it returns immediately. Safe to enqueue
    multiple times for the same application.

    Parameters are strings (not UUIDs) because Dramatiq serialises via JSON.
    """
    log = logger.bind(tenant_id=tenant_id, application_id=application_id)
    log.info("task.cv_screening.started")

    try:
        _run_async(_execute_screening(UUID(tenant_id), UUID(application_id)))
        log.info("task.cv_screening.finished")
    except Exception:
        log.exception("task.cv_screening.failed")
        raise


async def _execute_screening(tenant_id: UUID, application_id: UUID) -> None:
    """Async inner implementation — handles DB session lifecycle."""
    from sqlalchemy import select

    from src.config import get_settings
    from src.modules.ai.service import AIScreeningService
    from src.modules.recruitment.domain.models import CandidateScreeningResult
    from src.shared.database.session import get_engine, init_engine

    settings = get_settings()

    try:
        get_engine()
    except RuntimeError:
        init_engine(settings.DATABASE_URL)

    from src.shared.database.session import _session_factory

    if _session_factory is None:
        msg = "Session factory could not be initialised"
        raise RuntimeError(msg)

    async with _session_factory() as session:
        try:
            existing = await session.execute(
                select(CandidateScreeningResult).where(
                    CandidateScreeningResult.tenant_id == tenant_id,
                    CandidateScreeningResult.application_id == application_id,
                ),
            )
            if existing.scalar_one_or_none() is not None:
                logger.info(
                    "task.cv_screening.skipped_existing",
                    tenant_id=str(tenant_id),
                    application_id=str(application_id),
                )
                return

            service = AIScreeningService()
            await service.run_screening(session, tenant_id, application_id)
            await session.commit()
        except Exception:
            await session.rollback()
            raise
