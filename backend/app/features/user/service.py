"""Business logic for the user feature.

The service is the orchestration layer. It:

* Calls :class:`UserRepository` for persistence — never the session directly.
* Hashes passwords before they touch the DB.
* Raises domain exceptions (:class:`NotFoundError`, :class:`ConflictError`)
  which the global error handler turns into uniform JSON responses.
* Emits one INFO log line per state change (create / update / delete /
  password-reset). Reads are intentionally silent — too noisy otherwise.
* Never commits. The session lifecycle in
  :func:`app.core.database.get_db` commits once when the request handler
  returns cleanly, or rolls back on any raised exception.

Routers depend on :class:`UserService`, not :class:`UserRepository`. That
makes it cheap to add cross-cutting behaviour (caching, events, audit log)
in one place without rewriting every endpoint.
"""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.core.logging import get_logger
from app.core.pagination import PageParams
from app.core.security import hash_password
from app.core.sorting import SortParams
from app.features.user.models import User
from app.features.user.repository import UserRepository
from app.features.user.schema import (
    UserCreate,
    UserFilter,
    UserPasswordUpdate,
    UserUpdate,
)

log = get_logger(__name__)


class UserService:
    """Use cases for the User aggregate.

    Args:
        db: An :class:`AsyncSession` provided by FastAPI dependency injection.
            The service does not own the session's transaction; ``get_db``
            commits on success and rolls back on failure.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.repo = UserRepository(db)

    # ============================================================== reads ==
    async def get_by_id(self, user_id: UUID) -> User:
        """Return the user with ``user_id``.

        Args:
            user_id: Primary key.

        Returns:
            The user instance.

        Raises:
            NotFoundError: If no user has that id.
        """
        user = await self.repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError(f"User '{user_id}' not found")
        return user

    async def paginate(
        self,
        params: PageParams,
        filters: UserFilter,
        sort: SortParams | None = None,
    ) -> tuple[list[User], int]:
        """Return one page of users plus the total count under the filters.

        Args:
            params: Page number and page size.
            filters: Filter spec (search, is_active, created_from, ...).
            sort: Optional sort order. If ``None`` or empty, the repository's
                ``default_order_by`` applies.

        Returns:
            A ``(items, total)`` tuple. ``total`` is the count *with* filters
            applied — i.e. what the client would get if they walked every
            page.
        """
        where = self.repo.compile_filters(filters)
        return await self.repo.paginate(params, where=where, sort=sort)

    # ============================================================= writes ==
    async def create(self, payload: UserCreate) -> User:
        """Create a new user.

        Email is already lowercased by the schema validator. We re-check
        uniqueness here (cheap) rather than relying solely on the DB unique
        constraint, so we can return a clean 409 instead of a 500 from a
        racy ``IntegrityError`` (the unique index is still the source of
        truth for true concurrency).

        Args:
            payload: Validated create payload.

        Returns:
            The newly-persisted user, with ``id`` and timestamps populated.

        Raises:
            ConflictError: If the email is already taken.
        """
        if await self.repo.email_exists(payload.email):
            log.warning("user.create.conflict email=%s", payload.email)
            raise ConflictError(f"User with email '{payload.email}' already exists")

        user = User(
            email=payload.email,
            hashed_password=hash_password(payload.password),
            first_name=payload.first_name,
            last_name=payload.last_name,
            is_active=payload.is_active,
            is_superuser=payload.is_superuser,
        )
        await self.repo.add(user)
        log.info("user.created user_id=%s email=%s", user.id, user.email)
        return user

    async def update(self, user_id: UUID, payload: UserUpdate) -> User:
        """Partial update of mutable fields.

        Only keys present in the request payload are applied; everything
        else is left untouched. If the payload is empty (all fields unset)
        we short-circuit without dirtying the session.

        Args:
            user_id: Primary key.
            payload: Partial update payload.

        Returns:
            The updated user.

        Raises:
            NotFoundError: If no user has that id.
        """
        user = await self.get_by_id(user_id)
        changes = payload.model_dump(exclude_unset=True)
        if not changes:
            return user

        for field, value in changes.items():
            setattr(user, field, value)
        log.info(
            "user.updated user_id=%s fields=%s",
            user.id,
            ",".join(sorted(changes.keys())),
        )
        return user

    async def set_password(
        self, user_id: UUID, payload: UserPasswordUpdate
    ) -> None:
        """Replace a user's password (admin action).

        Backs ``PUT /users/{id}/password``. PUT semantics fit because we're
        replacing the resource state outright — no comparison against an
        "old" value. Self-service "I forgot my password" belongs in the
        future ``auth`` feature, which needs a token delivery mechanism.

        Raises:
            NotFoundError: If no user has that id.
        """
        user = await self.get_by_id(user_id)
        user.hashed_password = hash_password(payload.password)
        log.info("user.password_set user_id=%s", user.id)

    async def delete(self, user_id: UUID) -> None:
        """Hard-delete a user.

        Intentionally hard delete for now — once the ``employee`` feature
        lands we will likely switch to soft-delete (``is_active=False``) so
        we keep referential integrity with payroll/leave records. When that
        happens, swap this method's body; keep the signature.

        Raises:
            NotFoundError: If no user has that id.
        """
        user = await self.get_by_id(user_id)
        await self.repo.delete(user)
        log.info("user.deleted user_id=%s", user_id)
