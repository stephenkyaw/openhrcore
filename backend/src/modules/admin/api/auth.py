"""Authentication endpoints: login, logout, token refresh, current session."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import Settings, get_settings
from src.modules.recruitment.domain.models import UserAccount
from src.shared.auth.dependencies import CurrentUserDep
from src.shared.database.session import get_async_session

router = APIRouter(prefix="/auth", tags=["auth"])

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo


class UserInfo(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    tenant_id: str
    permissions: list[str]


def _create_access_token(
    user: UserAccount,
    settings: Settings,
) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)

    role_str = user.role if isinstance(user.role, str) else user.role.value

    payload = {
        "sub": str(user.id),
        "tenant_id": str(user.tenant_id),
        "email": user.email,
        "full_name": user.full_name,
        "role": role_str,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "iss": "openhrcore",
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


@router.post("/login", response_model=LoginResponse)
async def login(
    body: LoginRequest,
    session: SessionDep,
    settings: Annotated[Settings, Depends(get_settings)],
) -> LoginResponse:
    """Authenticate with email and password, returns a JWT."""
    query = select(UserAccount).where(UserAccount.email == body.email)
    result = await session.execute(query)
    user = result.scalars().first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.password_hash or not pwd_context.verify(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    from src.modules.admin.permissions import get_role_permissions

    role_str = user.role if isinstance(user.role, str) else user.role.value
    perms = await get_role_permissions(session, user.tenant_id, role_str)

    token = _create_access_token(user, settings)

    return LoginResponse(
        access_token=token,
        user=UserInfo(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=role_str,
            tenant_id=str(user.tenant_id),
            permissions=list(perms),
        ),
    )


@router.get("/session", response_model=UserInfo)
async def get_session(
    user: CurrentUserDep,
    session: SessionDep,
) -> UserInfo:
    """Return the current user's session info (validates the token is still valid)."""
    query = select(UserAccount).where(
        UserAccount.id == user.user_id,
        UserAccount.tenant_id == user.tenant_id,
    )
    result = await session.execute(query)
    account = result.scalars().first()

    if account is None or not account.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session invalid",
        )

    from src.modules.admin.permissions import get_role_permissions

    role_str = account.role if isinstance(account.role, str) else account.role.value
    perms = await get_role_permissions(session, account.tenant_id, role_str)

    return UserInfo(
        id=str(account.id),
        email=account.email,
        full_name=account.full_name,
        role=role_str,
        tenant_id=str(account.tenant_id),
        permissions=list(perms),
    )


@router.post("/logout")
async def logout() -> dict[str, str]:
    """Logout (client-side token removal). Server-side is stateless."""
    return {"message": "Logged out successfully"}
