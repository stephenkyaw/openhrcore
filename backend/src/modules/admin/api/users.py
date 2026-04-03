"""API routes for user management."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.auth.dependencies import CurrentUserDep
from src.shared.auth.models import CurrentUser
from src.shared.database.session import get_async_session

from ..permissions import Permission, get_role_permissions, require_permission
from ..schemas import (
    CurrentUserProfileResponse,
    RolePermissionsResponse,
    UserAccountCreate,
    UserAccountResponse,
    UserAccountUpdate,
)
from ..service import AdminService

router = APIRouter(prefix="/users", tags=["admin-users"])

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]
AdminUserDep = Annotated[CurrentUser, Depends(require_permission(Permission.MANAGE_USERS))]


@router.get("/me", response_model=CurrentUserProfileResponse)
async def get_current_profile(
    user: CurrentUserDep,
    session: SessionDep,
) -> CurrentUserProfileResponse:
    """Return the authenticated user's profile with resolved permissions."""
    svc = AdminService(session)
    account = await svc.get_user(user.tenant_id, user.user_id)
    role_str = account.role if isinstance(account.role, str) else account.role.value
    perms = await get_role_permissions(session, user.tenant_id, role_str)
    return CurrentUserProfileResponse(
        id=account.id,
        tenant_id=account.tenant_id,
        email=account.email,
        full_name=account.full_name,
        role=role_str,
        permissions=list(perms),
    )


@router.get("", response_model=list[UserAccountResponse])
async def list_users(
    user: AdminUserDep,
    session: SessionDep,
) -> list[UserAccountResponse]:
    """List all users for the current tenant (admin only)."""
    svc = AdminService(session)
    users = await svc.list_users(user.tenant_id)
    return [UserAccountResponse.model_validate(u) for u in users]


@router.post(
    "",
    response_model=UserAccountResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_user(
    body: UserAccountCreate,
    user: AdminUserDep,
    session: SessionDep,
) -> UserAccountResponse:
    """Create a new user account (admin only)."""
    svc = AdminService(session)
    new_user = await svc.create_user(user.tenant_id, body)
    return UserAccountResponse.model_validate(new_user)


@router.get("/{user_id}", response_model=UserAccountResponse)
async def get_user(
    user_id: UUID,
    user: CurrentUserDep,
    session: SessionDep,
) -> UserAccountResponse:
    """Get a specific user's details."""
    svc = AdminService(session)
    account = await svc.get_user(user.tenant_id, user_id)
    return UserAccountResponse.model_validate(account)


@router.patch("/{user_id}", response_model=UserAccountResponse)
async def update_user(
    user_id: UUID,
    body: UserAccountUpdate,
    user: AdminUserDep,
    session: SessionDep,
) -> UserAccountResponse:
    """Update a user's role or status (admin only)."""
    svc = AdminService(session)
    updated = await svc.update_user(user.tenant_id, user_id, body)
    return UserAccountResponse.model_validate(updated)


@router.delete("/{user_id}", response_model=UserAccountResponse)
async def deactivate_user(
    user_id: UUID,
    user: AdminUserDep,
    session: SessionDep,
) -> UserAccountResponse:
    """Deactivate a user account (admin only)."""
    svc = AdminService(session)
    deactivated = await svc.deactivate_user(user.tenant_id, user_id)
    return UserAccountResponse.model_validate(deactivated)


@router.post("/{user_id}/activate", response_model=UserAccountResponse)
async def activate_user(
    user_id: UUID,
    user: AdminUserDep,
    session: SessionDep,
) -> UserAccountResponse:
    """Reactivate a deactivated user account (admin only)."""
    svc = AdminService(session)
    activated = await svc.activate_user(user.tenant_id, user_id)
    return UserAccountResponse.model_validate(activated)


@router.get("/roles/list", response_model=list[RolePermissionsResponse])
async def list_roles_legacy(
    user: CurrentUserDep,
    session: SessionDep,
) -> list[RolePermissionsResponse]:
    """List all available roles with their permissions (legacy endpoint)."""
    svc = AdminService(session)
    roles = await svc.list_roles(user.tenant_id)
    return [
        RolePermissionsResponse(
            role=role.name,
            description=role.description,
            permissions=[rp.permission for rp in role.permissions],
        )
        for role in roles
    ]
