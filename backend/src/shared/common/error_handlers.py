"""FastAPI exception handlers for domain-level errors."""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .exceptions import AppError


def register_error_handlers(app: FastAPI) -> None:
    """Register exception handlers that translate ``AppError`` subclasses
    into structured JSON responses with the appropriate HTTP status code.
    """

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:  # noqa: ARG001
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )
