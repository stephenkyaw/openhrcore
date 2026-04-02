"""Business logic for user and tenant management."""

from __future__ import annotations

import uuid

from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.recruitment.domain.models import Tenant, UserAccount
from src.shared.common.exceptions import NotFoundError

from .schemas import TenantUpdate, UserAccountCreate, UserAccountUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AdminService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # -- Users ----------------------------------------------------------------

    async def list_users(self, tenant_id: uuid.UUID) -> list[UserAccount]:
        query = (
            select(UserAccount)
            .where(UserAccount.tenant_id == tenant_id)
            .order_by(UserAccount.created_at.desc())
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def get_user(self, tenant_id: uuid.UUID, user_id: uuid.UUID) -> UserAccount:
        query = (
            select(UserAccount)
            .where(UserAccount.tenant_id == tenant_id, UserAccount.id == user_id)
        )
        result = await self._session.execute(query)
        user = result.scalars().first()
        if user is None:
            raise NotFoundError("UserAccount", user_id)
        return user

    async def create_user(
        self, tenant_id: uuid.UUID, data: UserAccountCreate,
    ) -> UserAccount:
        user = UserAccount(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            keycloak_user_id=uuid.uuid4(),
            email=data.email,
            full_name=data.full_name,
            password_hash=pwd_context.hash(data.password),
            role=data.role,
            is_active=True,
        )
        self._session.add(user)
        await self._session.flush()
        await self._session.refresh(user)
        return user

    async def update_user(
        self, tenant_id: uuid.UUID, user_id: uuid.UUID, data: UserAccountUpdate,
    ) -> UserAccount:
        user = await self.get_user(tenant_id, user_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)
        self._session.add(user)
        await self._session.flush()
        await self._session.refresh(user)
        return user

    async def deactivate_user(
        self, tenant_id: uuid.UUID, user_id: uuid.UUID,
    ) -> UserAccount:
        user = await self.get_user(tenant_id, user_id)
        user.is_active = False
        self._session.add(user)
        await self._session.flush()
        await self._session.refresh(user)
        return user

    # -- Tenant ---------------------------------------------------------------

    async def get_tenant(self, tenant_id: uuid.UUID) -> Tenant:
        query = select(Tenant).where(Tenant.id == tenant_id)
        result = await self._session.execute(query)
        tenant = result.scalars().first()
        if tenant is None:
            raise NotFoundError("Tenant", tenant_id)
        return tenant

    async def update_tenant(
        self, tenant_id: uuid.UUID, data: TenantUpdate,
    ) -> Tenant:
        tenant = await self.get_tenant(tenant_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(tenant, key, value)
        self._session.add(tenant)
        await self._session.flush()
        await self._session.refresh(tenant)
        return tenant
