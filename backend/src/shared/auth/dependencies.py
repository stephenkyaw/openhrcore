"""FastAPI dependencies for JWT validation (local + Keycloak)."""

from __future__ import annotations

import uuid
from typing import Annotated

import httpx
import structlog
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from tenacity import retry, stop_after_attempt, wait_exponential

from src.config import Settings, get_settings
from src.shared.auth.models import CurrentUser, TokenPayload

logger = structlog.get_logger()

_bearer_scheme = HTTPBearer(auto_error=False)

_jwks_cache: dict[str, object] | None = None

_DEV_TENANT_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
_DEV_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
async def _fetch_jwks(settings: Settings) -> dict[str, object]:
    """Fetch the JSON Web Key Set from Keycloak with retry logic."""
    global _jwks_cache  # noqa: PLW0603
    if _jwks_cache is not None:
        return _jwks_cache

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(settings.keycloak_jwks_url)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        return _jwks_cache


def _decode_keycloak_token(token: str, jwks: dict[str, object], settings: Settings) -> TokenPayload:
    """Decode and validate a JWT using the Keycloak JWKS."""
    try:
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience=settings.KEYCLOAK_CLIENT_ID,
            issuer=f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}",
        )
        return TokenPayload(**payload)
    except JWTError as exc:
        logger.warning("auth.jwt_decode_failed", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def _try_decode_local_token(token: str, settings: Settings) -> CurrentUser | None:
    """Attempt to decode a locally-signed HS256 JWT. Returns None if it's not a local token."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_aud": False},
        )
        if payload.get("iss") != "openhrcore":
            return None
        return CurrentUser(
            user_id=uuid.UUID(payload["sub"]),
            tenant_id=uuid.UUID(payload["tenant_id"]),
            username=payload.get("full_name"),
            email=payload.get("email"),
            roles=[payload.get("role", "viewer")],
        )
    except (JWTError, KeyError, ValueError):
        return None


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> CurrentUser:
    """Validate the Bearer token and return a ``CurrentUser`` context.

    Tries local JWT first, then Keycloak. When ``AUTH_DEV_MODE`` is enabled
    and no token is provided, returns a deterministic dev user.
    """
    if credentials is not None:
        local_user = _try_decode_local_token(credentials.credentials, settings)
        if local_user is not None:
            return local_user

    if settings.AUTH_DEV_MODE and credentials is None:
        return CurrentUser(
            user_id=_DEV_USER_ID,
            tenant_id=_DEV_TENANT_ID,
            username="dev-admin",
            email="admin@openhrcore.local",
            roles=["admin"],
        )

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    jwks = await _fetch_jwks(settings)
    token_data = _decode_keycloak_token(credentials.credentials, jwks, settings)

    tenant_id = token_data.tenant_id
    if tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token does not contain a tenant_id claim",
        )

    roles: list[str] = token_data.realm_access.get("roles", [])

    return CurrentUser(
        user_id=token_data.sub,
        tenant_id=tenant_id,
        username=token_data.preferred_username,
        email=token_data.email,
        roles=roles,
    )


def require_roles(*required: str):
    """Return a dependency that enforces the caller has *all* listed roles."""

    async def _checker(
        current_user: Annotated[CurrentUser, Depends(get_current_user)],
    ) -> CurrentUser:
        missing = set(required) - set(current_user.roles)
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required roles: {', '.join(sorted(missing))}",
            )
        return current_user

    return _checker


def invalidate_jwks_cache() -> None:
    """Clear the cached JWKS so the next request re-fetches from Keycloak."""
    global _jwks_cache  # noqa: PLW0603
    _jwks_cache = None


CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]
"""Shorthand type alias for injecting the authenticated user into routes."""


def tenant_filter(user: CurrentUser) -> uuid.UUID:
    """Convenience extractor for building tenant-scoped queries."""
    return user.tenant_id
