"""Shared pytest fixtures.

Strategy
--------
* A separate Postgres database (default ``openhrcore_test``) is used for tests.
* Schema is created once per test session via SQLAlchemy ``Base.metadata.create_all``
  — we test against the ORM, not Alembic (migrations are validated separately).
* Each test truncates every table on entry, giving full isolation without
  the savepoint-restart dance.
* The FastAPI ``db_session`` dependency is overridden so route handlers
  resolve to a request-scoped session that commits like in prod.

Run with::

    docker compose run --rm api uv run pytest                 # everything
    docker compose run --rm api uv run pytest tests/unit      # only fast tests
"""

import os
from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

import app.models_registry  # noqa: F401 — ensures every model is registered
from app.api.deps import db_session
from app.core.config import settings
from app.core.database import Base
from app.main import app

# ---------------------------------------------------------------------------
# Test database
# ---------------------------------------------------------------------------
# Derive a sibling DB name with a "_test" suffix unless overridden.
_dev_url = settings.database_url
_default_test_url = _dev_url.rsplit("/", 1)[0] + "/openhrcore_test"
TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL", _default_test_url)

# NullPool: each new connection is opened fresh and closed when released.
# Avoids asyncpg's "unknown protocol state" error caused by connections being
# recycled across the per-test event loops pytest-asyncio creates.
test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(
    bind=test_engine, expire_on_commit=False, autoflush=False
)


# ---------------------------------------------------------------------------
# Session-scoped: build schema once per pytest run
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session", autouse=True)
async def _prepare_schema() -> AsyncGenerator[None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


# ---------------------------------------------------------------------------
# Function-scoped: clean DB + session per test
# ---------------------------------------------------------------------------
@pytest.fixture
async def db() -> AsyncGenerator[AsyncSession]:
    """Truncates every table, then yields a fresh session."""
    async with test_engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(
                text(f'TRUNCATE TABLE "{table.name}" RESTART IDENTITY CASCADE')
            )
    async with TestSessionLocal() as session:
        yield session


# ---------------------------------------------------------------------------
# Function-scoped: HTTP client with the db_session dep overridden
# ---------------------------------------------------------------------------
@pytest.fixture
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient]:
    """An ``httpx.AsyncClient`` wired to the FastAPI app, against the test DB.

    Each request opens its own short-lived session (just like in prod) so we
    exercise the real unit-of-work behaviour from ``core.database.get_db``.
    """
    async def _override_db() -> AsyncGenerator[AsyncSession]:
        async with TestSessionLocal() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            else:
                await session.commit()

    app.dependency_overrides[db_session] = _override_db
    transport = ASGITransport(app=app)
    try:
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac
    finally:
        app.dependency_overrides.clear()
