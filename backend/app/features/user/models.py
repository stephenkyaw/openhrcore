"""SQLAlchemy ORM model for ``users``.

Storage shape only. Domain logic lives in :mod:`.service`. HTTP-facing input
and output shapes live in :mod:`.schema`. Mixing those layers is the most
common source of cyclic imports and accidental data leaks (e.g. exposing
``hashed_password`` to the API), so keep them separate.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, UUIDMixin


class User(Base, UUIDMixin, TimestampMixin):
    """A platform user — anyone who can log in.

    Identity is the immutable UUID ``id``. The email is also unique but may
    be updated, so do not key foreign relationships off it. Email is stored
    lowercase; normalisation happens at the schema boundary so the ORM does
    not need to repeat it on every assignment.

    The ``hashed_password`` column holds an Argon2id hash produced by
    :func:`app.core.security.hash_password`. It is intentionally not exposed
    in :class:`app.features.user.schema.UserResponse`.
    """

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    @property
    def full_name(self) -> str:
        """Display name. Trims trailing whitespace if either part is empty."""
        return f"{self.first_name} {self.last_name}".strip()

    def __repr__(self) -> str:  # pragma: no cover — debug aid only
        return f"<User id={self.id} email={self.email!r}>"
