"""Pydantic models for authentication token data."""

from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class TokenPayload(BaseModel):
    """Decoded JWT token payload from Keycloak."""

    sub: uuid.UUID
    exp: int
    iat: int
    iss: str
    aud: str | list[str] = Field(default_factory=list)
    realm_access: dict[str, list[str]] = Field(default_factory=dict)
    tenant_id: uuid.UUID | None = None
    preferred_username: str | None = None
    email: str | None = None


class CurrentUser(BaseModel):
    """Resolved user context injected into route handlers via dependency."""

    user_id: uuid.UUID
    tenant_id: uuid.UUID
    username: str | None = None
    email: str | None = None
    roles: list[str] = Field(default_factory=list)
