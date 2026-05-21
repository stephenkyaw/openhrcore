"""Functional tests for ``UserService`` — service + repo + real Postgres.

These hit the test database (per-test truncation, see ``conftest``) but skip
HTTP entirely. They're the right tier for proving business rules.
"""

from uuid import uuid4

import pytest

from app.core.exceptions import ConflictError, NotFoundError
from app.core.pagination import PageParams
from app.core.security import verify_password
from app.features.user.schema import (
    UserCreate,
    UserFilter,
    UserPasswordUpdate,
    UserUpdate,
)
from app.features.user.service import UserService

pytestmark = pytest.mark.functional


def _make_payload(email: str = "anya@example.com", password: str = "password123") -> UserCreate:
    return UserCreate(
        email=email,
        password=password,
        first_name="Anya",
        last_name="Z",
    )


# ----------------------------------------------------------------- create
async def test_create_persists_user(db) -> None:
    service = UserService(db)
    user = await service.create(_make_payload())
    await db.commit()

    assert user.id is not None
    assert user.email == "anya@example.com"
    assert verify_password("password123", user.hashed_password)


async def test_create_normalises_email_case(db) -> None:
    service = UserService(db)
    user = await service.create(_make_payload(email="Anya@EXAMPLE.COM"))
    await db.commit()
    assert user.email == "anya@example.com"


async def test_create_duplicate_email_raises_conflict(db) -> None:
    service = UserService(db)
    await service.create(_make_payload(email="dup@example.com"))
    await db.commit()

    with pytest.raises(ConflictError):
        await service.create(_make_payload(email="dup@example.com"))


# ----------------------------------------------------------------- get
async def test_get_by_id_returns_user(db) -> None:
    service = UserService(db)
    created = await service.create(_make_payload())
    await db.commit()

    fetched = await service.get_by_id(created.id)
    assert fetched.id == created.id


async def test_get_by_id_missing_raises_not_found(db) -> None:
    service = UserService(db)
    with pytest.raises(NotFoundError):
        await service.get_by_id(uuid4())


# ----------------------------------------------------------------- update
async def test_update_partial_fields_only(db) -> None:
    service = UserService(db)
    user = await service.create(_make_payload())
    await db.commit()

    updated = await service.update(user.id, UserUpdate(first_name="Renamed"))
    await db.commit()

    assert updated.first_name == "Renamed"
    assert updated.last_name == "Z"  # untouched


async def test_update_empty_payload_is_noop(db) -> None:
    service = UserService(db)
    user = await service.create(_make_payload())
    await db.commit()
    original_updated_at = user.updated_at

    result = await service.update(user.id, UserUpdate())
    assert result.updated_at == original_updated_at


# --------------------------------------------------------------- password
async def test_set_password_changes_hash(db) -> None:
    service = UserService(db)
    user = await service.create(_make_payload(password="oldpassword"))
    await db.commit()
    original_hash = user.hashed_password

    await service.set_password(user.id, UserPasswordUpdate(password="newpassword123"))
    await db.commit()

    fresh = await service.get_by_id(user.id)
    assert fresh.hashed_password != original_hash
    assert verify_password("newpassword123", fresh.hashed_password)


# --------------------------------------------------------------- delete
async def test_delete_then_get_raises_not_found(db) -> None:
    service = UserService(db)
    user = await service.create(_make_payload())
    await db.commit()

    await service.delete(user.id)
    await db.commit()

    with pytest.raises(NotFoundError):
        await service.get_by_id(user.id)


# --------------------------------------------------------------- paginate
async def _seed_users(service: UserService, count: int) -> None:
    for i in range(count):
        await service.create(
            UserCreate(
                email=f"u{i}@example.com",
                password="password123",
                first_name=f"U{i}",
                last_name="Z",
                is_active=(i % 2 == 0),
            )
        )


async def test_paginate_total_matches_dataset(db) -> None:
    service = UserService(db)
    await _seed_users(service, 5)
    await db.commit()

    items, total = await service.paginate(
        PageParams(page=1, page_size=2), UserFilter()
    )
    assert total == 5
    assert len(items) == 2


async def test_paginate_search_matches_substring(db) -> None:
    service = UserService(db)
    await service.create(_make_payload(email="anya@example.com"))
    await service.create(
        UserCreate(
            email="bob@example.com",
            password="password123",
            first_name="Bob",
            last_name="X",
        )
    )
    await db.commit()

    items, total = await service.paginate(PageParams(), UserFilter(search="anya"))
    assert total == 1
    assert items[0].email == "anya@example.com"


async def test_paginate_is_active_filter(db) -> None:
    service = UserService(db)
    await _seed_users(service, 4)  # i=0,2 active; i=1,3 inactive
    await db.commit()

    _, active_total = await service.paginate(PageParams(), UserFilter(is_active=True))
    _, inactive_total = await service.paginate(
        PageParams(), UserFilter(is_active=False)
    )
    assert active_total == 2
    assert inactive_total == 2
