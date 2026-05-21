from collections.abc import Callable
from dataclasses import dataclass
from typing import Annotated

from fastapi import HTTPException, Query, status


@dataclass(frozen=True)
class SortField:
    field: str
    desc: bool


@dataclass(frozen=True)
class SortParams:
    fields: tuple[SortField, ...]

    def __bool__(self) -> bool:
        return bool(self.fields)


def parse_sort(
    allowed: set[str], default: str | None = None
) -> Callable[..., SortParams]:
    """Build a FastAPI dependency that parses `?sort=field,-other` strings.

    Prefix a field name with `-` for descending, `+` (or nothing) for ascending.
    Field names not in `allowed` are rejected with 400 — this is what prevents
    callers from sorting on arbitrary columns.
    """
    allowed_sorted = sorted(allowed)
    description = (
        "Comma-separated sort fields. Prefix `-` for descending. "
        f"Allowed: {', '.join(allowed_sorted)}"
    )

    def _dep(
        sort: Annotated[str | None, Query(description=description)] = default,
    ) -> SortParams:
        if not sort:
            return SortParams(fields=())
        out: list[SortField] = []
        for raw in sort.split(","):
            token = raw.strip()
            if not token:
                continue
            desc = token.startswith("-")
            name = token.lstrip("+-")
            if name not in allowed:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot sort by '{name}'. Allowed: {allowed_sorted}",
                )
            out.append(SortField(field=name, desc=desc))
        return SortParams(fields=tuple(out))

    return _dep
