"""Dynamic role-based access control with DB-backed permission resolution.

The Permission enum defines all known permissions. Actual role→permission
mappings live in the ``roles`` and ``role_permissions`` tables so tenants
can customise them at runtime.

A lightweight in-memory cache avoids hitting the DB on every request; the
cache is invalidated whenever roles are mutated via the admin API.
"""

from __future__ import annotations

import uuid
from enum import StrEnum
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.shared.auth.dependencies import CurrentUserDep, get_current_user
from src.shared.auth.models import CurrentUser
from src.shared.database.session import get_async_session


class Permission(StrEnum):
    MANAGE_USERS = "manage_users"
    MANAGE_TENANT = "manage_tenant"
    MANAGE_JOBS = "manage_jobs"
    MANAGE_CANDIDATES = "manage_candidates"
    MANAGE_APPLICATIONS = "manage_applications"
    MANAGE_PIPELINES = "manage_pipelines"
    RUN_SCREENING = "run_screening"
    MANAGE_NOTES = "manage_notes"
    VIEW_ALL = "view_all"
    MANAGE_ROLES = "manage_roles"


ALL_PERMISSIONS: list[dict[str, str]] = [
    {"key": "manage_users", "label": "Manage Users", "group": "Admin"},
    {"key": "manage_tenant", "label": "Manage Tenant", "group": "Admin"},
    {"key": "manage_roles", "label": "Manage Roles", "group": "Admin"},
    {"key": "manage_jobs", "label": "Manage Jobs", "group": "Recruitment"},
    {"key": "manage_candidates", "label": "Manage Candidates", "group": "Recruitment"},
    {"key": "manage_applications", "label": "Manage Applications", "group": "Recruitment"},
    {"key": "manage_pipelines", "label": "Manage Pipelines", "group": "Recruitment"},
    {"key": "run_screening", "label": "Run AI Screening", "group": "AI"},
    {"key": "manage_notes", "label": "Manage Notes", "group": "Collaboration"},
    {"key": "view_all", "label": "View All", "group": "General"},
]


# ---- In-memory permission cache (per-tenant, per-role name) ----
_cache: dict[tuple[uuid.UUID, str], set[str]] = {}


def invalidate_role_cache(tenant_id: uuid.UUID | None = None) -> None:
    """Drop cached permissions. Pass tenant_id to scope, or None to clear all."""
    if tenant_id is None:
        _cache.clear()
    else:
        keys_to_drop = [k for k in _cache if k[0] == tenant_id]
        for k in keys_to_drop:
            del _cache[k]


async def get_role_permissions(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    role_name: str,
) -> set[str]:
    """Resolve permissions for a role, using cache when available."""
    cache_key = (tenant_id, role_name)
    if cache_key in _cache:
        return _cache[cache_key]

    from src.modules.recruitment.domain.models import Role

    query = (
        select(Role)
        .where(Role.tenant_id == tenant_id, Role.name == role_name)
        .options(selectinload(Role.permissions))
    )
    result = await session.execute(query)
    role_obj = result.scalars().first()

    if role_obj is None:
        _cache[cache_key] = set()
        return set()

    perms = {rp.permission for rp in role_obj.permissions}
    _cache[cache_key] = perms
    return perms


async def has_permission(
    session: AsyncSession,
    user: CurrentUser,
    permission: str,
) -> bool:
    """Check if a user has a specific permission based on their DB role."""
    for role_name in user.roles:
        perms = await get_role_permissions(session, user.tenant_id, role_name)
        if permission in perms:
            return True
    return False


def require_permission(*permissions: Permission):
    """FastAPI dependency that enforces the caller has all listed permissions."""

    async def _checker(
        current_user: Annotated[CurrentUser, Depends(get_current_user)],
        session: Annotated[AsyncSession, Depends(get_async_session)],
    ) -> CurrentUser:
        for perm in permissions:
            if not await has_permission(session, current_user, perm.value):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required permission: {perm.value}",
                )
        return current_user

    return _checker


# ---- Defaults used during seeding (not at runtime) ----

ROLE_DESCRIPTIONS: dict[str, str] = {
    "admin": "Full access to all features including user and tenant management",
    "recruiter": "Manage the full recruitment lifecycle: jobs, candidates, applications, pipelines, and AI screening",
    "hiring_manager": "Review candidates and applications, add notes and feedback",
    "viewer": "Read-only access to jobs, candidates, and applications",
}

DEFAULT_ROLE_PERMISSIONS: dict[str, list[str]] = {
    "admin": [p.value for p in Permission],
    "recruiter": [
        Permission.MANAGE_JOBS, Permission.MANAGE_CANDIDATES,
        Permission.MANAGE_APPLICATIONS, Permission.MANAGE_PIPELINES,
        Permission.RUN_SCREENING, Permission.MANAGE_NOTES, Permission.VIEW_ALL,
    ],
    "hiring_manager": [Permission.VIEW_ALL, Permission.MANAGE_NOTES],
    "viewer": [Permission.VIEW_ALL],
}
