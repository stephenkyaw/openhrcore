"""API routes for AI-powered candidate screening."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.repository.screening import ScreeningRepository
from src.modules.recruitment.schemas.screening import ScreeningResultResponse
from src.modules.recruitment.tasks.screening_task import run_cv_screening
from src.shared.auth.dependencies import CurrentUserDep
from src.shared.common.exceptions import NotFoundError
from src.shared.database.session import get_async_session

router = APIRouter(prefix="/applications", tags=["screening"])

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]


@router.post(
    "/{application_id}/screening/run",
    status_code=status.HTTP_202_ACCEPTED,
)
async def trigger_screening(
    application_id: UUID,
    user: CurrentUserDep,
    session: SessionDep,  # noqa: ARG001 — kept for auth consistency
) -> JSONResponse:
    """Enqueue an AI screening task for the given application.

    Returns 202 Accepted immediately; the screening runs asynchronously
    in a Dramatiq worker.
    """
    run_cv_screening.send(str(user.tenant_id), str(application_id))
    return JSONResponse(
        status_code=status.HTTP_202_ACCEPTED,
        content={
            "detail": "Screening task enqueued",
            "application_id": str(application_id),
        },
    )


@router.get(
    "/{application_id}/screening-result",
    response_model=ScreeningResultResponse,
)
async def get_screening_result(
    application_id: UUID,
    user: CurrentUserDep,
    session: SessionDep,
) -> ScreeningResultResponse:
    """Retrieve the AI screening result for an application."""
    repo = ScreeningRepository(session)
    result = await repo.get_result_by_application(user.tenant_id, application_id)
    if result is None:
        raise NotFoundError("ScreeningResult", application_id)
    return ScreeningResultResponse.model_validate(result)
