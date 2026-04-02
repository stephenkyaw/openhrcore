"""Domain-level exception hierarchy.

These exceptions are caught by FastAPI exception handlers and translated into
appropriate HTTP error responses.
"""

from __future__ import annotations


class AppError(Exception):
    """Base class for all application-specific exceptions."""

    status_code: int = 500
    detail: str = "An unexpected error occurred"

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.__class__.detail
        super().__init__(self.detail)


class NotFoundError(AppError):
    """Raised when a requested resource does not exist."""

    status_code = 404
    detail = "Resource not found"

    def __init__(self, resource: str = "Resource", identifier: object = None) -> None:
        msg = f"{resource} not found"
        if identifier is not None:
            msg = f"{resource} with id '{identifier}' not found"
        super().__init__(msg)


class ForbiddenError(AppError):
    """Raised when the caller lacks permission for the requested action."""

    status_code = 403
    detail = "You do not have permission to perform this action"


class ConflictError(AppError):
    """Raised when a write conflicts with existing state (e.g. duplicate)."""

    status_code = 409
    detail = "Resource conflict"


class ValidationError(AppError):
    """Raised when business-rule validation fails (distinct from Pydantic)."""

    status_code = 422
    detail = "Validation failed"
