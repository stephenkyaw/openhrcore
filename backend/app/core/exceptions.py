from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base class for domain errors. Subclasses set ``status_code`` and ``code``."""

    default_status: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_code: str = "error"
    default_detail: str = "Unexpected error"

    def __init__(
        self,
        detail: str | None = None,
        *,
        status_code: int | None = None,
        code: str | None = None,
    ) -> None:
        super().__init__(
            status_code=status_code or self.default_status,
            detail=detail or self.default_detail,
        )
        self.code = code or self.default_code


class NotFoundError(AppException):
    default_status = status.HTTP_404_NOT_FOUND
    default_code = "not_found"
    default_detail = "Resource not found"


class ConflictError(AppException):
    default_status = status.HTTP_409_CONFLICT
    default_code = "conflict"
    default_detail = "Resource already exists"


class UnauthorizedError(AppException):
    default_status = status.HTTP_401_UNAUTHORIZED
    default_code = "unauthorized"
    default_detail = "Not authenticated"


class ForbiddenError(AppException):
    default_status = status.HTTP_403_FORBIDDEN
    default_code = "forbidden"
    default_detail = "Permission denied"


class ValidationError(AppException):
    default_status = status.HTTP_422_UNPROCESSABLE_CONTENT
    default_code = "validation_error"
    default_detail = "Invalid input"
