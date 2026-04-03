"""Pydantic request/response schemas for the admin module."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Roles
# ---------------------------------------------------------------------------

class RoleResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    description: str
    is_system: bool
    permissions: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RoleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)
    permissions: list[str] = Field(default_factory=list)


class RoleUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    permissions: list[str] | None = None


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

class UserAccountResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    keycloak_user_id: uuid.UUID
    email: str
    full_name: str
    is_active: bool
    role: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserAccountCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=6, max_length=128)
    role: str = Field(default="viewer", min_length=1, max_length=100)


class UserAccountUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    role: str | None = Field(default=None, min_length=1, max_length=100)
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=6, max_length=128)


# ---------------------------------------------------------------------------
# Tenant
# ---------------------------------------------------------------------------

class TenantResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    domain: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TenantUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: str | None = Field(default=None, min_length=1, max_length=255)
    domain: str | None = None


# ---------------------------------------------------------------------------
# Auth / Profile (kept for backward compat)
# ---------------------------------------------------------------------------

class RolePermissionsResponse(BaseModel):
    """Legacy shape — returned by /roles/list for backward compat."""
    role: str
    description: str
    permissions: list[str]


class CurrentUserProfileResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    email: str
    full_name: str
    role: str
    permissions: list[str]

    model_config = {"from_attributes": True}
