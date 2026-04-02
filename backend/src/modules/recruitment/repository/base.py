"""Generic async repository with tenant-isolated CRUD operations."""

from __future__ import annotations

from typing import Any, Generic, TypeVar
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.common.exceptions import NotFoundError
from src.shared.common.pagination import paginate
from src.shared.common.schemas import PaginatedResponse, PaginationParams
from src.shared.database.base import Base

T = TypeVar("T", bound=Base)


class BaseRepository(Generic[T]):
    """Provides common CRUD operations scoped to a single tenant.

    Every query automatically filters by ``tenant_id`` to guarantee
    multi-tenant data isolation.
    """

    def __init__(self, session: AsyncSession, model_class: type[T]) -> None:
        self._session = session
        self._model = model_class

    # -- helpers --------------------------------------------------------------

    @property
    def _model_name(self) -> str:
        return self._model.__name__

    def _base_query(self, tenant_id: UUID):
        return select(self._model).where(self._model.tenant_id == tenant_id)

    # -- read -----------------------------------------------------------------

    async def get_by_id(self, id: UUID, tenant_id: UUID) -> T:
        """Fetch a single entity by primary key within the given tenant.

        Raises ``NotFoundError`` when no matching row exists.
        """
        query = self._base_query(tenant_id).where(self._model.id == id)
        result = await self._session.execute(query)
        entity = result.scalars().first()
        if entity is None:
            raise NotFoundError(self._model_name, id)
        return entity

    async def list_all(
        self,
        tenant_id: UUID,
        params: PaginationParams,
        filters: dict[str, Any] | None = None,
    ) -> PaginatedResponse[T]:
        """Return a paginated list of entities for the tenant.

        ``filters`` is an optional mapping of column names to values used for
        exact-match filtering.
        """
        query = self._base_query(tenant_id)
        if filters:
            for col_name, value in filters.items():
                column = getattr(self._model, col_name, None)
                if column is not None:
                    query = query.where(column == value)
        query = query.order_by(self._model.created_at.desc())
        return await paginate(self._session, query, params)

    # -- write ----------------------------------------------------------------

    async def create(self, tenant_id: UUID, **kwargs: Any) -> T:
        """Create and persist a new entity belonging to *tenant_id*."""
        entity = self._model(tenant_id=tenant_id, **kwargs)
        self._session.add(entity)
        await self._session.flush()
        await self._session.refresh(entity)
        return entity

    async def update(self, entity: T, **kwargs: Any) -> T:
        """Apply attribute updates to an already-loaded entity."""
        for key, value in kwargs.items():
            if hasattr(entity, key):
                setattr(entity, key, value)
        self._session.add(entity)
        await self._session.flush()
        await self._session.refresh(entity)
        return entity

    async def delete(self, id: UUID, tenant_id: UUID) -> None:
        """Delete an entity by primary key within the given tenant.

        Raises ``NotFoundError`` if the row does not exist.
        """
        entity = await self.get_by_id(id, tenant_id)
        await self._session.delete(entity)
        await self._session.flush()
