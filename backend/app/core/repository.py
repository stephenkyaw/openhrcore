"""Generic async repository — the base class every feature repository extends."""

from typing import Any, ClassVar
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import ColumnElement, Select

from app.core.database import Base
from app.core.pagination import PageParams
from app.core.sorting import SortParams


class BaseRepository[T: Base]:
    """Async generic repository.

    Subclass and set ``model``. Override ``sortable_fields`` and
    ``default_order_by`` per feature. Every method is read-or-flush only —
    transactions are committed at the session boundary (see ``core.database``).
    """

    model: type[T]
    sortable_fields: ClassVar[set[str]] = set()
    default_order_by: ClassVar[tuple[str, ...]] = ("-id",)

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ----------------------------------------------------------------- private
    def _select(self) -> Select[tuple[T]]:
        return select(self.model)

    def _sort_column(self, name: str) -> Any:
        column = getattr(self.model, name, None)
        if column is None:
            raise ValueError(
                f"{self.model.__name__} has no sortable attribute '{name}'"
            )
        return column

    def _apply_sort(
        self, stmt: Select[tuple[T]], sort: SortParams | None
    ) -> Select[tuple[T]]:
        if sort and sort.fields:
            order = [
                self._sort_column(field.field).desc()
                if field.desc
                else self._sort_column(field.field).asc()
                for field in sort.fields
            ]
        else:
            order = []
            for spec in self.default_order_by:
                desc = spec.startswith("-")
                column = self._sort_column(spec.lstrip("+-"))
                order.append(column.desc() if desc else column.asc())
        return stmt.order_by(*order)

    # ----------------------------------------------------------------- queries
    async def get_by_id(self, entity_id: UUID) -> T | None:
        stmt = self._select().where(self.model.id == entity_id)  # type: ignore[attr-defined]
        return (await self.db.execute(stmt)).scalar_one_or_none()

    async def count(self, *where: ColumnElement[bool]) -> int:
        stmt = select(func.count()).select_from(self.model)
        if where:
            stmt = stmt.where(*where)
        return (await self.db.execute(stmt)).scalar_one()

    async def exists(self, *where: ColumnElement[bool]) -> bool:
        stmt = select(self.model.id).where(*where).limit(1)  # type: ignore[attr-defined]
        return (await self.db.execute(stmt)).first() is not None

    async def paginate(
        self,
        params: PageParams,
        where: list[ColumnElement[bool]] | None = None,
        sort: SortParams | None = None,
    ) -> tuple[list[T], int]:
        """Return one page of rows plus the total count under the same filters."""
        where = where or []
        total = await self.count(*where)

        stmt = self._select()
        if where:
            stmt = stmt.where(*where)
        stmt = self._apply_sort(stmt, sort).offset(params.offset).limit(params.limit)
        items = list((await self.db.execute(stmt)).scalars().all())
        return items, total

    # ------------------------------------------------------------------ writes
    async def add(self, obj: T) -> T:
        """Stage ``obj`` for insert and flush so generated columns populate."""
        self.db.add(obj)
        await self.db.flush()
        return obj

    async def delete(self, obj: T) -> None:
        await self.db.delete(obj)
        await self.db.flush()
