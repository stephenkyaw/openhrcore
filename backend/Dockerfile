# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# OpenHRCore backend — multi-stage Dockerfile.
#
#   base : Python 3.14 + uv + locked dependencies
#   dev  : adds dev tools (ruff, mypy, pytest), runs uvicorn with --reload
#   prod : excludes dev deps, runs as non-root, no reload
#
# Build dev:   docker build --target dev  -t openhrcore-backend:dev .
# Build prod:  docker build --target prod -t openhrcore-backend:prod .
# ---------------------------------------------------------------------------
FROM python:3.14-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never \
    UV_PROJECT_ENVIRONMENT=/app/.venv \
    PATH="/app/.venv/bin:${PATH}"

WORKDIR /app

# Pull the uv binary from its official multi-arch image — no compilation needed.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy lockfile first so the deps layer caches across source changes.
COPY pyproject.toml uv.lock ./

# ---------------------------------------------------------------------------
# dev — includes ruff/mypy/pytest, source is volume-mounted at runtime
# ---------------------------------------------------------------------------
FROM base AS dev

RUN uv sync --frozen --no-install-project
COPY . .
RUN uv sync --frozen

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ---------------------------------------------------------------------------
# prod — minimal image, no dev deps, non-root user
# ---------------------------------------------------------------------------
FROM base AS prod

RUN uv sync --frozen --no-install-project --no-dev
COPY . .
RUN uv sync --frozen --no-dev

# Drop privileges
RUN useradd --create-home --uid 1000 app && chown -R app:app /app
USER app

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
