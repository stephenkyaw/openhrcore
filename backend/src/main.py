"""FastAPI application factory for OpenHRCore."""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from src.config import get_settings
from src.shared.common.error_handlers import register_error_handlers
from src.shared.database.session import dispose_engine, init_engine


def _configure_logging() -> None:
    """Set up structlog with stdlib integration."""
    settings = get_settings()

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer() if not settings.DEBUG else structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    logging.basicConfig(
        format="%(message)s",
        level=getattr(logging, settings.LOG_LEVEL),
    )


@asynccontextmanager
async def _lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manage startup/shutdown resources."""
    settings = get_settings()
    init_engine(settings.DATABASE_URL)
    structlog.get_logger().info("openhrcore.startup", app_name=settings.APP_NAME)
    yield
    await dispose_engine()
    structlog.get_logger().info("openhrcore.shutdown")


def create_app() -> FastAPI:
    """Build and return the configured FastAPI application."""
    settings = get_settings()
    _configure_logging()

    app = FastAPI(
        title=settings.APP_NAME,
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        default_response_class=ORJSONResponse,
        lifespan=_lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_error_handlers(app)
    _register_routers(app)

    return app


def _register_routers(app: FastAPI) -> None:
    """Include all module routers under the API prefix."""
    from src.modules.admin.api import router as admin_router
    from src.modules.recruitment.api import router as recruitment_router

    api_prefix = "/api/v1/openhrcore"

    app.include_router(recruitment_router, prefix=api_prefix)
    app.include_router(admin_router, prefix=api_prefix)

    @app.get("/health", tags=["infra"])
    async def health_check() -> dict[str, str]:
        return {"status": "healthy"}
