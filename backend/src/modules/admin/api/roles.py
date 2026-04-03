"""API routes for dynamic role management."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.auth.models import CurrentUser
from src.shared.database.session import get_async_session

from ..permissions import ALL_PERMISSIONS, Permission, require_permission
from ..schemas import RoleCreate, RoleResponse, RoleUpdate
from ..service import AdminService

router = APIRouter(prefix="/roles", tags=["admin-roles"])

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]
AdminRoleDep = Annotated[CurrentUser, Depends(require_permission(Permission.MANAGE_ROLES))]


def _role_to_response(role) -> RoleResponse:
    return RoleResponse(
        id=role.id,
        tenant_id=role.tenant_id,
        name=role.name,
        description=role.description,
        is_system=role.is_system,
        permissions=[rp.permission for rp in role.permissions],
        created_at=role.created_at,
        updated_at=role.updated_at,
    )


@router.get("", response_model=list[RoleResponse])
async def list_roles(
    user: AdminRoleDep,
    session: SessionDep,
) -> list[RoleResponse]:
    """List all roles for the current tenant."""
    svc = AdminService(session)
    roles = await svc.list_roles(user.tenant_id)
    return [_role_to_response(r) for r in roles]


@router.get("/permissions")
async def list_permissions(
    user: AdminRoleDep,
) -> list[dict[str, str]]:
    """List all available permissions that can be assigned to roles."""
    return ALL_PERMISSIONS


@router.post(
    "",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_role(
    body: RoleCreate,
    user: AdminRoleDep,
    session: SessionDep,
) -> RoleResponse:
    """Create a new custom role."""
    svc = AdminService(session)
    role = await svc.create_role(user.tenant_id, body)
    return _role_to_response(role)


@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: UUID,
    user: AdminRoleDep,
    session: SessionDep,
) -> RoleResponse:
    """Get a specific role by ID."""
    svc = AdminService(session)
    role = await svc.get_role(user.tenant_id, role_id)
    return _role_to_response(role)


@router.patch("/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: UUID,
    body: RoleUpdate,
    user: AdminRoleDep,
    session: SessionDep,
) -> RoleResponse:
    """Update a role's name, description, or permissions."""
    svc = AdminService(session)
    role = await svc.update_role(user.tenant_id, role_id, body)
    return _role_to_response(role)


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: UUID,
    user: AdminRoleDep,
    session: SessionDep,
) -> None:
    """Delete a custom role (system roles cannot be deleted)."""
    svc = AdminService(session)
    await svc.delete_role(user.tenant_id, role_id)
