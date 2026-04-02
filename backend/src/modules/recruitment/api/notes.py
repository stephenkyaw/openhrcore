"""API routes for recruitment notes on applications."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.schemas.note import NoteCreate, NoteResponse
from src.modules.recruitment.service.note_service import NoteService
from src.shared.auth.dependencies import CurrentUserDep
from src.shared.common.schemas import PaginatedResponse, PaginationParams
from src.shared.database.session import get_async_session

router = APIRouter(prefix="/applications", tags=["notes"])

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]

NoteListResponse = PaginatedResponse[NoteResponse]


@router.post(
    "/{application_id}/notes",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_note(
    application_id: UUID,
    body: NoteCreate,
    user: CurrentUserDep,
    session: SessionDep,
) -> NoteResponse:
    """Add a note to an application."""
    svc = NoteService(session)
    note = await svc.create_note(
        user.tenant_id,
        user.user_id,
        application_id,
        body,
    )
    return NoteResponse.model_validate(note)


@router.get(
    "/{application_id}/notes",
    response_model=NoteListResponse,
)
async def list_notes(
    application_id: UUID,
    user: CurrentUserDep,
    session: SessionDep,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> NoteListResponse:
    """List notes for an application, newest first."""
    svc = NoteService(session)
    params = PaginationParams(page=page, page_size=page_size)
    result = await svc.list_notes(user.tenant_id, application_id, params)
    return NoteListResponse.model_validate(result, from_attributes=True)
