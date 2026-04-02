"""API routes for job openings."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.domain.models import JobOpeningStatus
from src.modules.recruitment.schemas.job_opening import (
    JobOpeningCreate,
    JobOpeningListResponse,
    JobOpeningResponse,
    JobOpeningUpdate,
)
from src.modules.recruitment.service.job_opening_service import JobOpeningService
from src.shared.auth.dependencies import CurrentUserDep
from src.shared.common.schemas import PaginationParams
from src.shared.database.session import get_async_session

router = APIRouter(prefix="/jobs", tags=["jobs"])

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]


@router.post(
    "",
    response_model=JobOpeningResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_job(
    body: JobOpeningCreate,
    user: CurrentUserDep,
    session: SessionDep,
) -> JobOpeningResponse:
    """Create a new job opening."""
    svc = JobOpeningService(session)
    job = await svc.create_job(user.tenant_id, user.user_id, body)
    return JobOpeningResponse.model_validate(job)


@router.get("", response_model=JobOpeningListResponse)
async def list_jobs(
    user: CurrentUserDep,
    session: SessionDep,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status_filter: JobOpeningStatus | None = Query(default=None, alias="status"),
) -> JobOpeningListResponse:
    """List job openings with optional status filter."""
    svc = JobOpeningService(session)
    params = PaginationParams(page=page, page_size=page_size)
    result = await svc.list_jobs(user.tenant_id, params, status=status_filter)
    return JobOpeningListResponse.model_validate(result, from_attributes=True)


@router.get("/{job_id}", response_model=JobOpeningResponse)
async def get_job(
    job_id: UUID,
    user: CurrentUserDep,
    session: SessionDep,
) -> JobOpeningResponse:
    """Retrieve a single job opening with application count."""
    svc = JobOpeningService(session)
    job = await svc.get_job(user.tenant_id, job_id)
    return JobOpeningResponse.model_validate(job)


@router.patch("/{job_id}", response_model=JobOpeningResponse)
async def update_job(
    job_id: UUID,
    body: JobOpeningUpdate,
    user: CurrentUserDep,
    session: SessionDep,
) -> JobOpeningResponse:
    """Partially update a job opening."""
    svc = JobOpeningService(session)
    job = await svc.update_job(user.tenant_id, job_id, body)
    return JobOpeningResponse.model_validate(job)
