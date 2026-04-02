"""Role-based access control: static permission matrix and FastAPI dependency."""

from __future__ import annotations

from enum import StrEnum
from typing import Annotated

from fastapi import Depends, HTTPException, status

from src.shared.auth.dependencies import CurrentUserDep, get_current_user
from src.shared.auth.models import CurrentUser


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


ROLE_PERMISSIONS: dict[str, set[Permission]] = {
    "admin": set(Permission),
    "recruiter": {
        Permission.MANAGE_JOBS,
        Permission.MANAGE_CANDIDATES,
        Permission.MANAGE_APPLICATIONS,
        Permission.MANAGE_PIPELINES,
        Permission.RUN_SCREENING,
        Permission.MANAGE_NOTES,
        Permission.VIEW_ALL,
    },
    "hiring_manager": {
        Permission.VIEW_ALL,
        Permission.MANAGE_NOTES,
    },
    "viewer": {
        Permission.VIEW_ALL,
    },
}

ROLE_DESCRIPTIONS: dict[str, str] = {
    "admin": "Full access to all features including user and tenant management",
    "recruiter": "Manage the full recruitment lifecycle: jobs, candidates, applications, pipelines, and AI screening",
    "hiring_manager": "Review candidates and applications, add notes and feedback",
    "viewer": "Read-only access to jobs, candidates, and applications",
}


def get_role_permissions(role: str) -> set[Permission]:
    return ROLE_PERMISSIONS.get(role, set())


def has_permission(user: CurrentUser, permission: Permission) -> bool:
    """Check if a user has a specific permission based on their DB role."""
    for role in user.roles:
        if permission in get_role_permissions(role):
            return True
    return False


def require_permission(*permissions: Permission):
    """FastAPI dependency that enforces the caller has all listed permissions."""

    async def _checker(
        current_user: Annotated[CurrentUser, Depends(get_current_user)],
    ) -> CurrentUser:
        for perm in permissions:
            if not has_permission(current_user, perm):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required permission: {perm.value}",
                )
        return current_user

    return _checker
