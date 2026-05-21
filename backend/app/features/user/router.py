"""HTTP endpoints for the user feature.

Routers are kept deliberately thin:

* They parse the URL/query/body via FastAPI deps.
* They call exactly one service method.
* They convert the returned ORM model into a response schema and return it.

No business rules, no SQL, no logging here. If you find yourself wanting to
add an ``if`` for a business condition, it belongs in :mod:`.service`.

REST conventions enforced here:

* Resource names are plural (``/users``).
* HTTP verbs do the action — never put verbs in the path.
* Sub-resources for non-CRUD actions (``/users/{id}/password``).
* ``201 Created`` includes a ``Location`` header pointing at the new resource.
* ``PATCH`` for partial updates; ``PUT`` for idempotent replace; ``DELETE`` for delete.
* ``204 No Content`` for successful no-body responses.

Every endpoint declares ``summary``/``description``/``response_model`` so the
OpenAPI docs read well and the JSON shape is enforced server-side.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Request, Response, status

from app.core.pagination import Page, PageParams, page_params
from app.features.user.deps import (
    UserFilterDep,
    UserServiceDep,
    UserSortDep,
)
from app.features.user.schema import (
    UserCreate,
    UserPasswordUpdate,
    UserResponse,
    UserUpdate,
)

router = APIRouter(prefix="/users", tags=["users"])

PageDep = Annotated[PageParams, Depends(page_params)]


# ---------------------------------------------------------------------------
# Read endpoints
# ---------------------------------------------------------------------------
@router.get(
    "",
    response_model=Page[UserResponse],
    summary="List users",
    description=(
        "Paginated list of users. Supports case-insensitive search across "
        "email and name, boolean filters, a created-at range, and "
        "comma-separated sort fields (prefix `-` for descending)."
    ),
)
async def list_users(
    service: UserServiceDep,
    page: PageDep,
    filters: UserFilterDep,
    sort: UserSortDep,
) -> Page[UserResponse]:
    users, total = await service.paginate(page, filters, sort)
    return Page.build(
        [UserResponse.model_validate(u) for u in users], total, page
    )


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get a user by id",
    responses={404: {"description": "User not found"}},
)
async def get_user(user_id: UUID, service: UserServiceDep) -> UserResponse:
    user = await service.get_by_id(user_id)
    return UserResponse.model_validate(user)


# ---------------------------------------------------------------------------
# Write endpoints
# ---------------------------------------------------------------------------
@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a user",
    responses={409: {"description": "Email already in use"}},
)
async def create_user(
    payload: UserCreate,
    service: UserServiceDep,
    request: Request,
    response: Response,
) -> UserResponse:
    user = await service.create(payload)
    # REST: 201 Created points clients at the new resource. We use url_for so
    # the path includes the application-wide /api/v1 prefix, not just this
    # router's own /users prefix.
    response.headers["Location"] = request.url_for("get_user", user_id=user.id).path
    return UserResponse.model_validate(user)


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update a user (partial)",
    description=(
        "Partial update. Fields omitted from the body are left unchanged."
    ),
    responses={404: {"description": "User not found"}},
)
async def update_user(
    user_id: UUID, payload: UserUpdate, service: UserServiceDep
) -> UserResponse:
    user = await service.update(user_id, payload)
    return UserResponse.model_validate(user)


@router.put(
    "/{user_id}/password",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Set a user's password (admin)",
    description=(
        "Replaces the password outright. Idempotent: PUT'ing the same body "
        "twice yields the same state. The user is **not** notified — wire "
        "email delivery in a higher-level workflow if you need that."
    ),
    responses={404: {"description": "User not found"}},
)
async def set_user_password(
    user_id: UUID, payload: UserPasswordUpdate, service: UserServiceDep
) -> None:
    await service.set_password(user_id, payload)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user",
    responses={404: {"description": "User not found"}},
)
async def delete_user(user_id: UUID, service: UserServiceDep) -> None:
    await service.delete(user_id)
