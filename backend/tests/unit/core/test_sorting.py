"""Unit tests for ``parse_sort``."""

import pytest
from fastapi import HTTPException

from app.core.sorting import parse_sort

pytestmark = pytest.mark.unit

ALLOWED = {"email", "first_name", "created_at"}


def test_no_sort_param_returns_empty_when_no_default() -> None:
    dep = parse_sort(ALLOWED)
    result = dep(sort=None)
    assert result.fields == ()
    assert not result  # falsy


def test_default_applies_when_sort_not_passed() -> None:
    dep = parse_sort(ALLOWED, default="-created_at")
    result = dep()  # uses default
    assert len(result.fields) == 1
    assert result.fields[0].field == "created_at"
    assert result.fields[0].desc is True


def test_single_asc_field() -> None:
    dep = parse_sort(ALLOWED)
    result = dep(sort="email")
    assert len(result.fields) == 1
    assert result.fields[0].field == "email"
    assert result.fields[0].desc is False


def test_plus_prefix_is_ascending() -> None:
    dep = parse_sort(ALLOWED)
    result = dep(sort="+email")
    assert result.fields[0].desc is False


def test_minus_prefix_is_descending() -> None:
    dep = parse_sort(ALLOWED)
    result = dep(sort="-created_at")
    assert result.fields[0].desc is True


def test_multiple_fields_preserve_order() -> None:
    dep = parse_sort(ALLOWED)
    result = dep(sort="-created_at,email,-first_name")
    assert [(f.field, f.desc) for f in result.fields] == [
        ("created_at", True),
        ("email", False),
        ("first_name", True),
    ]


def test_disallowed_field_raises_400() -> None:
    dep = parse_sort(ALLOWED)
    with pytest.raises(HTTPException) as exc:
        dep(sort="hashed_password")
    assert exc.value.status_code == 400
    assert "hashed_password" in exc.value.detail


def test_blank_tokens_are_skipped() -> None:
    dep = parse_sort(ALLOWED)
    result = dep(sort="email,, ,created_at")
    assert len(result.fields) == 2
