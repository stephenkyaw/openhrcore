"""FastAPI dependencies for the user feature.

This module is the only place where HTTP concerns (Query, Depends) meet
business concerns (UserService, UserFilter, sorting). It builds the small
``Annotated`` aliases the router consumes:

* :data:`UserServiceDep` — injects a ready-to-use :class:`UserService`.
* :data:`UserFilterDep`  — parses filter query params into :class:`UserFilter`.
* :data:`UserSortDep`    — parses ``?sort=`` against the repository's allow-list.

Keeping these aliases here means routes read like declarative wiring rather
than function-arg soup, and adding a new dep doesn't touch the router.

.. note::
   Do **not** put ``from __future__ import annotations`` at the top of any
   module that FastAPI introspects (deps, router). Stringified annotations
   break the metadata extraction Pydantic v2 uses for ``Query(...)``.
"""

from datetime import datetime
from typing import Annotated

from fastapi import Depends, Query

from app.api.deps import DbSession
from app.core.sorting import SortParams, parse_sort
from app.features.user.repository import UserRepository
from app.features.user.schema import UserFilter
from app.features.user.service import UserService

#: Default sort order applied when the client omits ``?sort=``.
DEFAULT_USER_SORT = "-created_at"


# ---------------------------------------------------------------------------
# Dependency factories
# ---------------------------------------------------------------------------
def get_user_service(db: DbSession) -> UserService:
    """Build a :class:`UserService` bound to the current request's session."""
    return UserService(db)


def get_user_filter(
    search: Annotated[
        str | None,
        Query(description="Match email, first_name, last_name (case-insensitive)."),
    ] = None,
    is_active: Annotated[bool | None, Query()] = None,
    is_superuser: Annotated[bool | None, Query()] = None,
    created_from: Annotated[
        datetime | None,
        Query(description="ISO timestamp; matches users created at or after this."),
    ] = None,
    created_to: Annotated[
        datetime | None,
        Query(description="ISO timestamp; matches users created strictly before this."),
    ] = None,
) -> UserFilter:
    """Assemble a :class:`UserFilter` from query-string parameters.

    Each argument surfaces as its own query param in OpenAPI rather than a
    nested JSON blob. Keep this signature aligned with :class:`UserFilter`
    field-for-field so adding a filter is a one-stop change.
    """
    return UserFilter(
        search=search,
        is_active=is_active,
        is_superuser=is_superuser,
        created_from=created_from,
        created_to=created_to,
    )


#: Sort parser bound to the user repository's allow-list. Field names outside
#: ``UserRepository.sortable_fields`` return HTTP 400.
parse_user_sort = parse_sort(
    UserRepository.sortable_fields, default=DEFAULT_USER_SORT
)


# ---------------------------------------------------------------------------
# Public Annotated aliases used by the router
# ---------------------------------------------------------------------------
UserServiceDep = Annotated[UserService, Depends(get_user_service)]
UserFilterDep = Annotated[UserFilter, Depends(get_user_filter)]
UserSortDep = Annotated[SortParams, Depends(parse_user_sort)]
