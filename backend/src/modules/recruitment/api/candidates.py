"""API routes for candidates."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.schemas.candidate import (
    CandidateCreate,
    CandidateResponse,
    CandidateUpdate,
)
from src.modules.recruitment.service.candidate_service import CandidateService
from src.shared.auth.dependencies import CurrentUserDep
from src.shared.common.schemas import PaginatedResponse, PaginationParams
from src.shared.database.session import get_async_session

router = APIRouter(prefix="/candidates", tags=["candidates"])

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]

CandidateListResponse = PaginatedResponse[CandidateResponse]


@router.post(
    "",
    response_model=CandidateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_candidate(
    body: CandidateCreate,
    user: CurrentUserDep,
    session: SessionDep,
) -> CandidateResponse:
    """Create a new candidate with optional contact information."""
    svc = CandidateService(session)
    candidate = await svc.create_candidate(user.tenant_id, body)
    return CandidateResponse.model_validate(candidate)


@router.get("", response_model=CandidateListResponse)
async def list_candidates(
    user: CurrentUserDep,
    session: SessionDep,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
) -> CandidateListResponse:
    """List candidates with optional search by name or email."""
    svc = CandidateService(session)
    params = PaginationParams(page=page, page_size=page_size)
    result = await svc.list_candidates(user.tenant_id, params, search=search)
    return CandidateListResponse.model_validate(result, from_attributes=True)


@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(
    candidate_id: UUID,
    user: CurrentUserDep,
    session: SessionDep,
) -> CandidateResponse:
    """Retrieve a single candidate with contact details."""
    svc = CandidateService(session)
    candidate = await svc.get_candidate(user.tenant_id, candidate_id)
    return CandidateResponse.model_validate(candidate)


@router.patch("/{candidate_id}", response_model=CandidateResponse)
async def update_candidate(
    candidate_id: UUID,
    body: CandidateUpdate,
    user: CurrentUserDep,
    session: SessionDep,
) -> CandidateResponse:
    """Partially update a candidate."""
    svc = CandidateService(session)
    candidate = await svc.update_candidate(user.tenant_id, candidate_id, body)
    return CandidateResponse.model_validate(candidate)
