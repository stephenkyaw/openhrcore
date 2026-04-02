"""API routes for recruitment pipelines."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.repository.pipeline import PipelineRepository
from src.modules.recruitment.schemas.pipeline import (
    PipelineCreate,
    PipelineResponse,
)
from src.modules.recruitment.service.application_service import ApplicationService
from src.shared.auth.dependencies import CurrentUserDep
from src.shared.database.session import get_async_session

router = APIRouter(prefix="/pipelines", tags=["pipelines"])

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]


@router.get("", response_model=list[PipelineResponse])
async def list_pipelines(
    user: CurrentUserDep,
    session: SessionDep,
) -> list[PipelineResponse]:
    """List all pipelines for the current tenant."""
    repo = PipelineRepository(session)
    pipelines = await repo.list_with_stages(user.tenant_id)
    return [PipelineResponse.model_validate(p) for p in pipelines]


@router.post(
    "",
    response_model=PipelineResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_pipeline(
    body: PipelineCreate,
    user: CurrentUserDep,
    session: SessionDep,
) -> PipelineResponse:
    """Create a pipeline with its stages."""
    repo = PipelineRepository(session)
    stages_data = [s.model_dump() for s in body.stages]
    pipeline = await repo.create_with_stages(
        user.tenant_id,
        name=body.name,
        is_default=body.is_default,
        job_opening_id=body.job_opening_id,
        stages_data=stages_data,
    )
    return PipelineResponse.model_validate(pipeline)


@router.get("/{pipeline_id}", response_model=PipelineResponse)
async def get_pipeline(
    pipeline_id: UUID,
    user: CurrentUserDep,
    session: SessionDep,
) -> PipelineResponse:
    """Retrieve a pipeline with its stages."""
    repo = PipelineRepository(session)
    pipeline = await repo.get_with_stages(pipeline_id, user.tenant_id)
    return PipelineResponse.model_validate(pipeline)


@router.get("/{pipeline_id}/board")
async def get_pipeline_board(
    pipeline_id: UUID,
    user: CurrentUserDep,
    session: SessionDep,
) -> list[dict]:
    """Get the Kanban board view — applications grouped by pipeline stage."""
    svc = ApplicationService(session)
    return await svc.get_pipeline_board(user.tenant_id, pipeline_id)
