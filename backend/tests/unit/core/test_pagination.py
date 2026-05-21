"""Unit tests for pagination primitives."""

import pytest

from app.core.pagination import Page, PageParams

pytestmark = pytest.mark.unit


def test_offset_first_page_is_zero() -> None:
    assert PageParams(page=1, page_size=20).offset == 0


def test_offset_advances_by_page_size() -> None:
    assert PageParams(page=3, page_size=25).offset == 50


def test_limit_equals_page_size() -> None:
    assert PageParams(page=1, page_size=42).limit == 42


def test_page_size_lower_bound_rejected() -> None:
    with pytest.raises(ValueError):
        PageParams(page=1, page_size=0)


def test_page_size_upper_bound_rejected() -> None:
    with pytest.raises(ValueError):
        PageParams(page=1, page_size=101)


def test_page_build_preserves_metadata() -> None:
    params = PageParams(page=4, page_size=15)
    page = Page.build(items=["a", "b"], total=123, params=params)
    assert page.items == ["a", "b"]
    assert page.total == 123
    assert page.page == 4
    assert page.page_size == 15
