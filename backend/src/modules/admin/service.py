"""Business logic for user, role, and tenant management."""

from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.recruitment.domain.models import (
    Role,
    RolePermissionEntry,
    Tenant,
    UserAccount,
)
from src.shared.common.exceptions import NotFoundError

from .permissions import invalidate_role_cache
from .schemas import (
    RoleCreate,
    RoleUpdate,
    TenantUpdate,
    UserAccountCreate,
    UserAccountUpdate,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AdminService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # -- Roles ----------------------------------------------------------------

    async def list_roles(self, tenant_id: uuid.UUID) -> list[Role]:
        query = (
            select(Role)
            .where(Role.tenant_id == tenant_id)
            .options(selectinload(Role.permissions))
            .order_by(Role.is_system.desc(), Role.name)
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def get_role(self, tenant_id: uuid.UUID, role_id: uuid.UUID) -> Role:
        query = (
            select(Role)
            .where(Role.tenant_id == tenant_id, Role.id == role_id)
            .options(selectinload(Role.permissions))
        )
        result = await self._session.execute(query)
        role = result.scalars().first()
        if role is None:
            raise NotFoundError("Role", role_id)
        return role

    async def get_role_by_name(self, tenant_id: uuid.UUID, name: str) -> Role | None:
        query = (
            select(Role)
            .where(Role.tenant_id == tenant_id, Role.name == name)
            .options(selectinload(Role.permissions))
        )
        result = await self._session.execute(query)
        return result.scalars().first()

    async def create_role(self, tenant_id: uuid.UUID, data: RoleCreate) -> Role:
        existing = await self.get_role_by_name(tenant_id, data.name)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Role '{data.name}' already exists",
            )
        role = Role(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            name=data.name,
            description=data.description,
            is_system=False,
        )
        self._session.add(role)
        await self._session.flush()

        for perm in data.permissions:
            self._session.add(RolePermissionEntry(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                role_id=role.id,
                permission=perm,
            ))
        await self._session.flush()
        invalidate_role_cache(tenant_id)

        return await self.get_role(tenant_id, role.id)

    async def update_role(
        self, tenant_id: uuid.UUID, role_id: uuid.UUID, data: RoleUpdate,
    ) -> Role:
        role = await self.get_role(tenant_id, role_id)

        if data.name is not None and data.name != role.name:
            if role.is_system:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot rename a system role",
                )
            dup = await self.get_role_by_name(tenant_id, data.name)
            if dup is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Role '{data.name}' already exists",
                )
            role.name = data.name

        if data.description is not None:
            role.description = data.description

        self._session.add(role)
        await self._session.flush()

        if data.permissions is not None:
            for rp in list(role.permissions):
                await self._session.delete(rp)
            await self._session.flush()

            for perm in data.permissions:
                self._session.add(RolePermissionEntry(
                    id=uuid.uuid4(),
                    tenant_id=tenant_id,
                    role_id=role.id,
                    permission=perm,
                ))
            await self._session.flush()

        invalidate_role_cache(tenant_id)

        return await self.get_role(tenant_id, role.id)

    async def delete_role(self, tenant_id: uuid.UUID, role_id: uuid.UUID) -> None:
        role = await self.get_role(tenant_id, role_id)
        if role.is_system:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete a system role",
            )

        users_with_role = await self._session.execute(
            select(UserAccount.id)
            .where(UserAccount.tenant_id == tenant_id, UserAccount.role == role.name)
            .limit(1)
        )
        if users_with_role.scalars().first() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete a role that is assigned to users. Reassign them first.",
            )

        await self._session.delete(role)
        await self._session.flush()
        invalidate_role_cache(tenant_id)

    # -- Users ----------------------------------------------------------------

    async def _validate_role_name(self, tenant_id: uuid.UUID, role_name: str) -> None:
        """Ensure the role exists for this tenant."""
        role = await self.get_role_by_name(tenant_id, role_name)
        if role is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role '{role_name}' does not exist",
            )

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
        await self._validate_role_name(tenant_id, data.role)
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
        new_password = update_data.pop("password", None)

        if "role" in update_data:
            await self._validate_role_name(tenant_id, update_data["role"])

        for key, value in update_data.items():
            setattr(user, key, value)
        if new_password:
            user.password_hash = pwd_context.hash(new_password)
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

    async def activate_user(
        self, tenant_id: uuid.UUID, user_id: uuid.UUID,
    ) -> UserAccount:
        user = await self.get_user(tenant_id, user_id)
        user.is_active = True
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
