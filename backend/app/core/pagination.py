"""Pagination primitives shared by every list endpoint."""

from typing import Annotated

from fastapi import Query
from pydantic import BaseModel, Field


class PageParams(BaseModel):
    """Query-string pagination params, used as a FastAPI dependency."""

    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


def page_params(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> PageParams:
    return PageParams(page=page, page_size=page_size)


class Page[T](BaseModel):
    """Standard paginated response envelope.

    Use as ``Page[UserResponse]`` (etc.) in route ``response_model=``.
    """

    items: list[T]
    total: int
    page: int
    page_size: int

    @classmethod
    def build(cls, items: list[T], total: int, params: PageParams) -> "Page[T]":
        return cls(items=items, total=total, page=params.page, page_size=params.page_size)
