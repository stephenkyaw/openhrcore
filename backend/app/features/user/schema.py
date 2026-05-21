"""Pydantic schemas for the user feature.

Schemas are the wire shape — separate from the ORM model so we can evolve
storage independently of the API contract. We use four kinds:

* ``UserCreate``  — POST body. Includes password (write-only).
* ``UserUpdate``  — PATCH body. Every field optional; only set keys apply.
* ``UserFilter``  — query-string filters for the list endpoint.
* ``UserResponse`` — what we hand back to callers. Never includes
  ``hashed_password``.

Normalisation happens here, once, at the boundary. Anywhere downstream can
trust that ``email`` is already lowercased.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# ---------------------------------------------------------------------------
# Field constraints — kept as module constants so they're easy to audit and
# reuse. If you change one, every schema that depends on it updates together.
# ---------------------------------------------------------------------------
NAME_MIN_LEN = 1
NAME_MAX_LEN = 100
PASSWORD_MIN_LEN = 8
PASSWORD_MAX_LEN = 128


# ---------------------------------------------------------------------------
# Mixins
# ---------------------------------------------------------------------------
class _LowercaseEmailMixin:
    """Normalise the ``email`` field to lowercase before any other validation.

    Applied via a ``before`` validator with ``check_fields=False`` so it works
    on every schema that declares an ``email`` field, without each schema
    having to repeat the validator.
    """

    @field_validator("email", mode="before", check_fields=False)
    @classmethod
    def _lowercase_email(cls, value: object) -> object:
        return value.lower() if isinstance(value, str) else value


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------
class UserBase(_LowercaseEmailMixin, BaseModel):
    """Common fields shared by create + response shapes."""

    email: EmailStr
    first_name: str = Field(min_length=NAME_MIN_LEN, max_length=NAME_MAX_LEN)
    last_name: str = Field(min_length=NAME_MIN_LEN, max_length=NAME_MAX_LEN)
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(UserBase):
    """Payload for ``POST /users``.

    ``password`` is plain text on the wire; the service hashes it before
    persisting. Never log this object directly — use ``model_dump(exclude={"password"})``.
    """

    password: str = Field(min_length=PASSWORD_MIN_LEN, max_length=PASSWORD_MAX_LEN)


class UserUpdate(BaseModel):
    """Payload for ``PATCH /users/{id}``.

    All fields optional. The service applies only keys that were present in
    the request (via ``model_dump(exclude_unset=True)``), so callers can send
    partial updates without nuking other fields to ``None``.
    """

    first_name: str | None = Field(
        default=None, min_length=NAME_MIN_LEN, max_length=NAME_MAX_LEN
    )
    last_name: str | None = Field(
        default=None, min_length=NAME_MIN_LEN, max_length=NAME_MAX_LEN
    )
    is_active: bool | None = None
    is_superuser: bool | None = None


class UserPasswordUpdate(BaseModel):
    """Payload for ``PUT /users/{id}/password`` (admin sets a new password).

    The field is just ``password`` — no ``new_password`` distinction is
    needed because PUT replaces the resource state outright; there is no
    "old" value to compare against. (Self-service "change my own password"
    is a separate concern; it will live in the future ``auth`` feature
    where the old password is required.)
    """

    password: str = Field(min_length=PASSWORD_MIN_LEN, max_length=PASSWORD_MAX_LEN)


class UserFilter(BaseModel):
    """Query-string filters for the paginated user list.

    Each field becomes a separate query param via :func:`app.features.user.deps.get_user_filter`,
    so they show up individually in OpenAPI. The repository's
    :meth:`UserRepository.compile_filters` turns this object into SQL.
    """

    search: str | None = Field(
        default=None,
        description="Case-insensitive substring match against email, first_name, last_name.",
    )
    is_active: bool | None = None
    is_superuser: bool | None = None
    created_from: datetime | None = Field(
        default=None, description="ISO timestamp; created_at >= created_from."
    )
    created_to: datetime | None = Field(
        default=None, description="ISO timestamp; created_at < created_to."
    )


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------
class UserResponse(BaseModel):
    """Public view of a user. Excludes ``hashed_password``."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    is_active: bool
    is_superuser: bool
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime
