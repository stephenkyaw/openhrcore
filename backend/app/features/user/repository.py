"""Data access layer for the user feature.

The repository owns every SQL statement that touches the ``users`` table.
Nothing above it (service, router) should construct ``select()``, call
``self.db.execute(...)``, or import :mod:`sqlalchemy` directly. That rule is
what keeps business logic decoupled from storage.

Subclassing :class:`app.core.repository.BaseRepository` gives the standard
primitives (``get_by_id``, ``paginate``, ``count``, ``exists``, ``add``,
``delete``). This module only adds queries that are specific to users —
right now, the email lookups and the filter compiler.

Transactions are owned by the session lifecycle in
:func:`app.core.database.get_db`; never call ``self.db.commit()`` here.
"""

from typing import ClassVar

from sqlalchemy import func, or_
from sqlalchemy.sql import ColumnElement

from app.core.repository import BaseRepository
from app.features.user.models import User
from app.features.user.schema import UserFilter


class UserRepository(BaseRepository[User]):
    """Repository for :class:`User`.

    Attributes:
        sortable_fields: Allow-list of fields ``parse_sort`` accepts from the
            client. Anything outside this set returns 400 — that's the
            guardrail against ``?sort=hashed_password`` and similar abuse.
        default_order_by: Used when the client doesn't pass ``?sort=``.
            Same syntax as the query string (``-`` prefix for descending).
    """

    model = User

    sortable_fields: ClassVar[set[str]] = {
        "email",
        "first_name",
        "last_name",
        "is_active",
        "is_superuser",
        "last_login_at",
        "created_at",
        "updated_at",
    }
    default_order_by: ClassVar[tuple[str, ...]] = ("-created_at",)

    # ------------------------------------------------------------------ reads
    async def get_by_email(self, email: str) -> User | None:
        """Return the user with the given email or ``None``.

        Args:
            email: Already-lowercased email. Callers must normalise before
                invoking — :mod:`.schema` guarantees this for HTTP traffic.
        """
        stmt = self._select().where(User.email == email)
        return (await self.db.execute(stmt)).scalar_one_or_none()

    async def email_exists(self, email: str) -> bool:
        """Cheap existence check used for uniqueness validation on create.

        Uses a ``SELECT id ... LIMIT 1`` so it short-circuits on the first
        matching row without loading the whole user.
        """
        return await self.exists(User.email == email)

    # ------------------------------------------------------ filter compilation
    @staticmethod
    def compile_filters(filters: UserFilter) -> list[ColumnElement[bool]]:
        """Translate a :class:`UserFilter` spec into SQLAlchemy WHERE clauses.

        Kept ``@staticmethod`` because it doesn't touch the session — that
        makes it trivial to unit-test without a database. Add new filters
        here, keeping the same shape: read one attribute, append one clause.

        Args:
            filters: The user-supplied filter object.

        Returns:
            A list of clauses suitable for ``BaseRepository.paginate(where=...)``.
            Empty if no filter fields are set.
        """
        where: list[ColumnElement[bool]] = []

        if filters.search:
            # Case-insensitive partial match across the three name-y columns.
            # Using `func.lower()` + LIKE for portability; if we ever target
            # Postgres only, switch to ILIKE for an index-friendly query.
            like_pattern = f"%{filters.search.lower()}%"
            where.append(
                or_(
                    func.lower(User.email).like(like_pattern),
                    func.lower(User.first_name).like(like_pattern),
                    func.lower(User.last_name).like(like_pattern),
                )
            )

        if filters.is_active is not None:
            where.append(User.is_active == filters.is_active)
        if filters.is_superuser is not None:
            where.append(User.is_superuser == filters.is_superuser)

        # Half-open interval [created_from, created_to) — standard for time
        # ranges; lets callers chain "today / this week" without overlap.
        if filters.created_from is not None:
            where.append(User.created_at >= filters.created_from)
        if filters.created_to is not None:
            where.append(User.created_at < filters.created_to)

        return where
