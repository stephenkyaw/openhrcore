"""Shared utilities: exceptions, schemas, pagination."""

from src.shared.common.exceptions import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
)
from src.shared.common.pagination import paginate
from src.shared.common.schemas import ErrorResponse, PaginatedResponse, PaginationParams

__all__ = [
    "ConflictError",
    "ErrorResponse",
    "ForbiddenError",
    "NotFoundError",
    "PaginatedResponse",
    "PaginationParams",
    "ValidationError",
    "paginate",
]
