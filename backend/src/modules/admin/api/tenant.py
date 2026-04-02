"""API routes for tenant settings."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.auth.dependencies import CurrentUserDep
from src.shared.auth.models import CurrentUser
from src.shared.database.session import get_async_session

from ..permissions import Permission, require_permission
from ..schemas import TenantResponse, TenantUpdate
from ..service import AdminService

router = APIRouter(prefix="/tenant", tags=["admin-tenant"])

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]
AdminUserDep = Annotated[CurrentUser, Depends(require_permission(Permission.MANAGE_TENANT))]


@router.get("", response_model=TenantResponse)
async def get_tenant(
    user: CurrentUserDep,
    session: SessionDep,
) -> TenantResponse:
    """Get the current tenant's details."""
    svc = AdminService(session)
    tenant = await svc.get_tenant(user.tenant_id)
    return TenantResponse.model_validate(tenant)


@router.patch("", response_model=TenantResponse)
async def update_tenant(
    body: TenantUpdate,
    user: AdminUserDep,
    session: SessionDep,
) -> TenantResponse:
    """Update tenant settings (admin only)."""
    svc = AdminService(session)
    tenant = await svc.update_tenant(user.tenant_id, body)
    return TenantResponse.model_validate(tenant)
