"""Unit tests for ``UserRepository.compile_filters``.

These don't need a database — ``compile_filters`` is a ``@staticmethod`` that
turns a filter spec into a list of SQLAlchemy expressions. We only need to
verify which clauses are produced (not the SQL they emit; SQLAlchemy itself
is responsible for that).
"""

from datetime import UTC, datetime

import pytest

from app.features.user.repository import UserRepository
from app.features.user.schema import UserFilter

pytestmark = pytest.mark.unit


def test_empty_filter_yields_no_clauses() -> None:
    assert UserRepository.compile_filters(UserFilter()) == []


def test_search_yields_one_clause() -> None:
    where = UserRepository.compile_filters(UserFilter(search="anya"))
    assert len(where) == 1


def test_is_active_yields_one_clause() -> None:
    where = UserRepository.compile_filters(UserFilter(is_active=True))
    assert len(where) == 1


def test_is_superuser_yields_one_clause() -> None:
    where = UserRepository.compile_filters(UserFilter(is_superuser=False))
    assert len(where) == 1


def test_created_range_yields_two_clauses() -> None:
    where = UserRepository.compile_filters(
        UserFilter(
            created_from=datetime(2026, 1, 1, tzinfo=UTC),
            created_to=datetime(2026, 2, 1, tzinfo=UTC),
        )
    )
    assert len(where) == 2


def test_all_filters_combine() -> None:
    where = UserRepository.compile_filters(
        UserFilter(
            search="a",
            is_active=True,
            is_superuser=False,
            created_from=datetime(2026, 1, 1, tzinfo=UTC),
            created_to=datetime(2026, 2, 1, tzinfo=UTC),
        )
    )
    assert len(where) == 5
