"""API routes for candidate document uploads."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.schemas.document import DocumentUploadResponse
from src.modules.recruitment.service.document_service import DocumentService
from src.shared.auth.dependencies import CurrentUserDep
from src.shared.database.session import get_async_session

router = APIRouter(prefix="/candidates", tags=["documents"])

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]


@router.post(
    "/{candidate_id}/documents/cv",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_cv(
    candidate_id: UUID,
    file: UploadFile,
    user: CurrentUserDep,
    session: SessionDep,
    application_id: UUID | None = None,
) -> DocumentUploadResponse:
    """Upload a CV document for a candidate."""
    svc = DocumentService(session)
    document = await svc.upload_cv(
        user.tenant_id,
        user.user_id,
        candidate_id,
        application_id,
        file,
    )
    return DocumentUploadResponse.model_validate(document)
