"""Pagination utility for async SQLAlchemy queries."""

from __future__ import annotations

import math
from typing import Any, Sequence, TypeVar

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.common.schemas import PaginatedResponse, PaginationParams

T = TypeVar("T")


async def paginate(
    session: AsyncSession,
    query: Select[Any],
    params: PaginationParams,
    *,
    scalars: bool = True,
) -> PaginatedResponse[Any]:
    """Execute *query* with pagination and return a ``PaginatedResponse``.

    Parameters
    ----------
    session:
        The active async database session.
    query:
        A SQLAlchemy ``select()`` statement **without** limit/offset applied.
    params:
        Page number and page size from the request.
    scalars:
        If ``True`` (default), call ``.scalars().all()`` on the result;
        set to ``False`` for multi-column / row-tuple queries.
    """
    count_query = select(func.count()).select_from(query.subquery())
    total: int = (await session.execute(count_query)).scalar_one()

    paginated_query = query.offset(params.offset).limit(params.page_size)
    result = await session.execute(paginated_query)
    items: Sequence[Any] = result.scalars().all() if scalars else result.all()

    total_pages = max(1, math.ceil(total / params.page_size))

    return PaginatedResponse(
        items=list(items),
        total=total,
        page=params.page,
        page_size=params.page_size,
        total_pages=total_pages,
    )
