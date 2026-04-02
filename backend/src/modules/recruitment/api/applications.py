"""API routes for applications and stage transitions."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.repository.stage_transition import (
    StageTransitionRepository,
)
from src.modules.recruitment.schemas.application import (
    ApplicationCreate,
    ApplicationListResponse,
    ApplicationResponse,
    MoveStageRequest,
    StageTransitionResponse,
)
from src.modules.recruitment.service.application_service import ApplicationService
from src.modules.workflow.service.pipeline_service import PipelineWorkflowService
from src.shared.auth.dependencies import CurrentUserDep
from src.shared.common.schemas import PaginationParams
from src.shared.database.session import get_async_session

router = APIRouter(prefix="/applications", tags=["applications"])

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_application(
    body: ApplicationCreate,
    user: CurrentUserDep,
    session: SessionDep,
) -> ApplicationResponse:
    """Create a new application for a candidate–job pair."""
    svc = ApplicationService(session)
    application = await svc.create_application(user.tenant_id, body)
    return ApplicationResponse.model_validate(application)


@router.get("", response_model=ApplicationListResponse)
async def list_applications(
    user: CurrentUserDep,
    session: SessionDep,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    job_opening_id: UUID | None = Query(default=None),
) -> ApplicationListResponse:
    """List applications, optionally filtered by job opening."""
    svc = ApplicationService(session)
    params = PaginationParams(page=page, page_size=page_size)
    result = await svc.list_applications(
        user.tenant_id,
        params,
        job_opening_id=job_opening_id,
    )
    return ApplicationListResponse.model_validate(result, from_attributes=True)


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: UUID,
    user: CurrentUserDep,
    session: SessionDep,
) -> ApplicationResponse:
    """Retrieve a single application with full details."""
    svc = ApplicationService(session)
    application = await svc.get_application(user.tenant_id, application_id)
    return ApplicationResponse.model_validate(application)


@router.post(
    "/{application_id}/move-stage",
    response_model=StageTransitionResponse,
)
async def move_stage(
    application_id: UUID,
    body: MoveStageRequest,
    user: CurrentUserDep,
    session: SessionDep,
) -> StageTransitionResponse:
    """Move an application to a different pipeline stage."""
    workflow = PipelineWorkflowService()
    transition = await workflow.move_stage(
        session,
        user.tenant_id,
        user.user_id,
        application_id,
        body.to_stage_id,
        body.notes,
    )
    return StageTransitionResponse.model_validate(transition)


@router.get(
    "/{application_id}/stage-history",
    response_model=list[StageTransitionResponse],
)
async def get_stage_history(
    application_id: UUID,
    user: CurrentUserDep,
    session: SessionDep,
) -> list[StageTransitionResponse]:
    """Return the full stage-transition history for an application."""
    repo = StageTransitionRepository(session)
    transitions = await repo.list_by_application(user.tenant_id, application_id)
    return [StageTransitionResponse.model_validate(t) for t in transitions]
