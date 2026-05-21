"""Unit tests for user schemas (validation + normalisation)."""

import pytest
from pydantic import ValidationError

from app.features.user.schema import (
    UserCreate,
    UserPasswordUpdate,
    UserResponse,
    UserUpdate,
)

pytestmark = pytest.mark.unit


# ---------------------------------------------------------------------- create
def test_create_lowercases_email() -> None:
    payload = UserCreate(
        email="Anya@Example.COM",
        password="password123",
        first_name="Anya",
        last_name="Z",
    )
    assert payload.email == "anya@example.com"


def test_create_rejects_short_password() -> None:
    with pytest.raises(ValidationError):
        UserCreate(
            email="anya@example.com",
            password="short",
            first_name="A",
            last_name="B",
        )


def test_create_rejects_invalid_email() -> None:
    with pytest.raises(ValidationError):
        UserCreate(
            email="not-an-email",
            password="password123",
            first_name="A",
            last_name="B",
        )


def test_create_rejects_empty_name() -> None:
    with pytest.raises(ValidationError):
        UserCreate(
            email="a@b.co",
            password="password123",
            first_name="",
            last_name="B",
        )


# ---------------------------------------------------------------------- update
def test_update_allows_no_fields() -> None:
    # All-optional. An empty PATCH body should be valid.
    payload = UserUpdate()
    assert payload.model_dump(exclude_unset=True) == {}


def test_update_exclude_unset_returns_only_sent_fields() -> None:
    payload = UserUpdate(first_name="New")
    assert payload.model_dump(exclude_unset=True) == {"first_name": "New"}


# ----------------------------------------------------------------- password
def test_password_update_rejects_short() -> None:
    with pytest.raises(ValidationError):
        UserPasswordUpdate(password="short")


# ----------------------------------------------------------------- response
def test_response_never_contains_hashed_password() -> None:
    # Defence-in-depth: even with from_attributes, a stray attr shouldn't leak.
    fields = set(UserResponse.model_fields)
    assert "hashed_password" not in fields
    assert "password" not in fields
