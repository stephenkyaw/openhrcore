from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.core.exceptions import AppException
from app.core.logging import get_logger

log = get_logger("app.errors")


def _body(code: str, detail: object) -> dict[str, object]:
    return {"code": code, "detail": detail}


async def app_exception_handler(_request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=_body(exc.code or "error", exc.detail),
    )


async def validation_exception_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=_body("validation_error", exc.errors()),
    )


async def integrity_error_handler(_request: Request, exc: IntegrityError) -> JSONResponse:
    log.warning("DB integrity error: %s", exc.orig)
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content=_body("integrity_error", "Database integrity constraint violated"),
    )


async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    log.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=_body("internal_error", "Internal server error"),
    )


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(IntegrityError, integrity_error_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
