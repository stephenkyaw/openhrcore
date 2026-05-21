# OpenHRCore Backend

FastAPI + SQLAlchemy 2.0 (async) + PostgreSQL + Alembic on Python 3.13+.
Each feature is a folder under `app/features/` with its own `models.py`,
`schema.py`, `repository.py`, `service.py`, `router.py`, `deps.py`.

## Stack

| Tool | Version pin | Purpose |
| --- | --- | --- |
| Python | `3.13+` (CI uses 3.14) | Language. Pinned in `.python-version`. |
| [uv](https://docs.astral.sh/uv/) | latest | Package + venv manager. |
| FastAPI | `>=0.136` | HTTP framework. |
| SQLAlchemy | `>=2.0` async | ORM. |
| asyncpg | latest | Async Postgres driver. |
| Alembic | latest | DB migrations. |
| Pydantic v2 | `>=2.13` | Schemas + settings. |
| argon2-cffi | latest | Password hashing (Argon2id). |
| [ruff](https://docs.astral.sh/ruff/) | latest | Linter + formatter. |
| mypy | latest | Static type checking. |
| pytest + pytest-asyncio | latest | Tests. |

---

## Layout

```
backend/
  app/
    core/                    # cross-cutting infrastructure
      config.py              # Pydantic Settings from .env
      database.py            # async engine, session, Base, mixins
      security.py            # password hashing (argon2-cffi)
      exceptions.py          # AppException + subclasses
      logging.py             # structured logging + request-id context
      middleware.py          # RequestContextMiddleware
      pagination.py          # PageParams, Page[T]
      sorting.py             # parse_sort, SortParams
      repository.py          # BaseRepository[T: Base]
      error_handlers.py      # JSON error envelope handlers
    api/
      deps.py                # DbSession
      v1/router.py           # aggregates feature routers
    features/
      user/                  # reference template — copy for new features
        models.py            # SQLAlchemy
        schema.py            # Pydantic
        repository.py        # UserRepository(BaseRepository[User])
        service.py           # UserService
        router.py            # /users endpoints
        deps.py              # UserServiceDep, UserFilterDep, UserSortDep
        __init__.py          # re-exports the public surface
    main.py
    models_registry.py       # imports feature models for Alembic
  alembic/
    env.py
    versions/
  alembic.ini
  pyproject.toml
  .python-version
  uv.lock                    # committed
  .env.example
```

### `core/` vs `common/`

`core/` is for **framework wiring** — code the app cannot start without
(config, db, middleware, error handlers, base repository). Pure utility
helpers (date math, slug, money) that aren't framework-specific will go
in a separate `common/` folder when we have any — none yet.

### Per-feature responsibilities

- **router.py** — HTTP only: parse input, call service, shape response. No DB code, no business rules.
- **service.py** — business rules, raises domain errors (`NotFoundError`, `ConflictError`). Uses repository.
- **repository.py** — SQL/ORM queries only. Extends `BaseRepository[T]`. Knows nothing about HTTP.
- **schema.py** — Pydantic v2 input/output. Never used by repository.
- **models.py** — SQLAlchemy models.
- **deps.py** — FastAPI dependency aliases for this feature.

---

## Common helpers

### Pagination, filtering, sorting

Every list endpoint follows the same shape: page params + a per-feature
filter schema + a sort parser.

```
GET /api/v1/users
  ?page=1&page_size=20
  &search=anya&is_active=true&is_superuser=false
  &created_from=2026-01-01T00:00:00
  &sort=-created_at,email
```

**Pagination** (`core/pagination.py`): `PageParams` + `Page[T]` response wrapper.

**Filtering** — per feature. Each feature declares a Pydantic `XxxFilter`
schema in `schema.py` and a `xxx_filter` dependency in `deps.py`. The
repository's `compile_filters(filters)` turns it into SQLAlchemy expressions.
Add a new filter field → add it to schema, dep, and repository.

**Sorting** (`core/sorting.py`): `?sort=field,-other` syntax.
`parse_sort(allowed, default)` is a dep factory; each feature picks its own
allow-list (typically `Repository.sortable_fields`). Field names outside
the allow-list return 400 — no risk of sorting on arbitrary columns.

```python
class UserRepository(BaseRepository[User]):
    model = User
    sortable_fields = {"email", "first_name", "created_at", ...}
    default_order_by = ("-created_at",)
```

### Base repository

```python
class UserRepository(BaseRepository[User]):
    model = User

    async def get_by_email(self, email: str) -> User | None:
        stmt = self._select().where(User.email == email)
        return (await self.db.execute(stmt)).scalar_one_or_none()
```

`BaseRepository[T: Base]` provides `get_by_id`, `paginate(params, where, sort)`,
`count(*where)`, `exists(*where)`, `add`, `delete`. Subclass it and add
feature-specific queries. **Never** call `self.db.commit()` from a repository
or service — see "Transactions" below.

### Transactions (unit of work)

`core/database.get_db` commits exactly once when the request handler returns
cleanly, and rolls back on any raised exception. Services and repositories
**never** commit explicitly; they `flush` when they need a generated id.

### Error envelope

All errors return a uniform JSON shape:

```json
{ "code": "not_found", "detail": "User not found" }
```

Raise `NotFoundError`, `ConflictError`, `ForbiddenError`, `ValidationError`
from services — the registered handler in `core/error_handlers.py` converts
them. Unhandled exceptions become `500` with `code = "internal_error"` and
the full stack trace is logged.

### Logging

Every log line carries the request id from `RequestContextMiddleware`:

```
2026-05-21T10:42:11 INFO    [3f7a…b1] app.features.user.service: user.created user_id=abc-123 email=...
```

Conventions:

```python
from app.core.logging import get_logger
log = get_logger(__name__)

log.info("user.created user_id=%s email=%s", user.id, user.email)   # state change
log.warning("user.create.conflict email=%s", payload.email)         # recoverable
```

- INFO for state changes (create / update / delete / password reset).
- WARNING for recoverable conflicts.
- Reads stay silent; the access log middleware already records them.

### Health checks

| Path | Purpose |
| --- | --- |
| `GET /health/live` | Process is up (no deps). |
| `GET /health/ready` | DB reachable (`SELECT 1`). |

### REST conventions

Every endpoint follows these rules — copy the `user/` feature and you get them for free.

| Rule | Example |
| --- | --- |
| Plural resource names | `/users`, not `/user`. |
| HTTP verb is the action; URL is the noun | `DELETE /users/{id}`, not `POST /users/{id}/delete`. |
| Non-CRUD actions become sub-resources | `PUT /users/{id}/password` (replace password), not `POST /users/{id}/reset-password`. |
| `POST` creates, returns `201 Created` + `Location` header | `Location: /api/v1/users/{new_id}`. |
| `PATCH` partial update; `PUT` idempotent replace | `PATCH /users/{id}` (partial); `PUT /users/{id}/password` (replace). |
| `DELETE` returns `204 No Content` | No body on success. |
| Filters / sort / pagination are query strings | `?search=x&is_active=true&sort=-created_at&page=2`. |
| Sort syntax matches JSON:API | `?sort=field,-other` — `-` prefix for descending. |
| Errors use a uniform envelope | `{ "code": "not_found", "detail": "..." }` — see `core/error_handlers.py`. |
| Path segments use kebab-case | `/users/{id}/reset-password` would be wrong; `/users/{id}/password` is right. |

### User feature endpoints

| Method | Path | Status codes | Purpose |
| --- | --- | --- | --- |
| `GET`    | `/api/v1/users` | `200`, `422` | Paginated list with search/filter/sort. |
| `POST`   | `/api/v1/users` | `201`, `409`, `422` | Create. Returns `Location` header. |
| `GET`    | `/api/v1/users/{id}` | `200`, `404` | Fetch one. |
| `PATCH`  | `/api/v1/users/{id}` | `200`, `404`, `422` | Partial update (only sent fields apply). |
| `PUT`    | `/api/v1/users/{id}/password` | `204`, `404`, `422` | Admin replaces password. Idempotent. |
| `DELETE` | `/api/v1/users/{id}` | `204`, `404` | Delete. |

---

## From zero on a new laptop

Six commands to a running stack with a seeded admin user:

```bash
# 1. Prereqs (one-time)
#    - Docker Desktop / Docker Engine
#    - uv: curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Clone + go to repo root
git clone <repo-url> openhrcore && cd openhrcore

# 3. Boot Postgres
docker compose up -d db

# 4. Generate the initial Alembic migration (only needed if alembic/versions/ is empty)
docker compose run --rm api uv run alembic revision --autogenerate -m "init"

# 5. Start the API (runs alembic upgrade head, then uvicorn --reload)
docker compose up -d

# 6. Create the first superuser (idempotent)
docker compose run --rm api uv run python -m app.cli seed-admin
```

Verify:

```bash
curl http://localhost:8000/health/ready
open http://localhost:8000/api/v1/docs
```

Connect pgAdmin (host-installed) to `localhost:5432`, user/db/password
all = `openhrcore`.

---

## Setup

You have two workflows. **Use Docker Compose if you just want the whole stack
running** (this is the recommended dev setup). **Use uv directly** if you want
the API on your host and only Postgres in a container.

### Option A — Docker Compose (recommended)

The `docker-compose.yml` at the repo root brings up two services:

| Service | Image | Port (host → container) | Volume |
| --- | --- | --- | --- |
| `db`  | `postgres:16-alpine`              | `5432 → 5432` | `pgdata` (named, persists across restarts) |
| `api` | built from `backend/Dockerfile`, `target=dev` | `8000 → 8000` | `./backend → /app` (bind), `api-venv → /app/.venv` (named) |

pgAdmin is **not** in compose — you run it on your host and connect to
`localhost:5432`.

#### First-time bootstrap

```bash
# from the repo root (one level up from backend/)
docker compose up -d db                                                       # 1. start Postgres
docker compose run --rm api uv run alembic revision --autogenerate -m "init"  # 2. generate first migration
docker compose up -d                                                          # 3. start API (runs upgrade head, then uvicorn)
docker compose logs -f api                                                    # 4. tail logs
```

After that, `docker compose up -d` is all you need on every subsequent boot.

#### How dev hot-reload works

The API container does three clever things so that editing files on your
host triggers an instant reload without breaking the venv:

1. `./backend` is bind-mounted to `/app` → uvicorn's `--reload` sees changes.
2. A named volume `api-venv:/app/.venv` overlays your host's `.venv` (which is built for your host's Python, not the container's Linux/3.14).
3. `alembic upgrade head` runs in the container's `command:` before uvicorn — so any new migration files you generate are applied on the next restart.

#### Compose cheat sheet

| Command | Use |
| --- | --- |
| `docker compose up -d` | start everything in the background |
| `docker compose ps` | show service status + ports |
| `docker compose logs -f api` | tail backend logs (Ctrl+C to stop tailing) |
| `docker compose logs -f db` | tail Postgres logs |
| `docker compose exec api bash` | shell inside the backend container |
| `docker compose exec db psql -U openhrcore` | open psql against the DB |
| `docker compose run --rm api <cmd>` | one-shot command (e.g. alembic, pytest) |
| `docker compose restart api` | reload after a config change |
| `docker compose build api` | rebuild image after Dockerfile / lock changes |
| `docker compose down` | stop everything (data persists in `pgdata`) |
| `docker compose down -v` | stop **and wipe** Postgres data |

#### pgAdmin connection settings

```
Host:     localhost
Port:     5432
Database: openhrcore
User:     openhrcore
Password: openhrcore
```

> The DSN from inside the API container is different — uses `db` as the
> host. The compose `environment:` block sets `DATABASE_URL` accordingly;
> your `.env` is for the native workflow (Option B).

### Option B — Native (uv on host)

Install **uv** (replaces pip + venv + pip-tools + pipx):

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh    # macOS / Linux
# Windows: see https://docs.astral.sh/uv/getting-started/installation/
```

Then in this folder:

```bash
cd backend
uv sync                                            # installs runtime + dev deps from uv.lock
cp .env.example .env                               # edit .env: set DATABASE_URL
```

`uv sync` creates `.venv/` automatically using the Python version in
`.python-version`. **Don't** `source .venv/bin/activate` — prefix every
command with `uv run` instead, which is faster and avoids stale-shell bugs.

Standalone Postgres (skip if you already used `docker compose` from Option A):

```bash
docker run -d --name openhrcore-pg \
  -e POSTGRES_USER=openhrcore -e POSTGRES_PASSWORD=openhrcore -e POSTGRES_DB=openhrcore \
  -p 5432:5432 postgres:16-alpine
```

---

## Database migrations (Alembic)

Alembic owns the schema. Every change to a model in `app/features/<name>/models.py`
**must** be paired with a new migration committed to the repo. Postgres is
the only supported target — we use Postgres-specific types (`UUID`, JSONB later).

### Where things live

```
backend/
  alembic.ini                  # alembic config (script location, log format)
  alembic/
    env.py                     # imports app.models_registry, points Alembic at Base.metadata
    script.py.mako             # template used when generating new revisions
    versions/                  # generated migration files — commit these
  app/
    models_registry.py         # imports every features/<x>/models.py so Alembic sees it
```

**If you add a new feature, you MUST import its `models` from
`app/models_registry.py`.** Anything not registered there is invisible to
autogenerate and will silently be missing from the next migration.

### Two kinds of migrations

| Kind | When | How |
| --- | --- | --- |
| **Schema migration** | You added / renamed / dropped a column, table, index, constraint. | `alembic revision --autogenerate -m "..."` then **read & edit** the generated file before committing. |
| **Data migration** | You need to backfill a column, normalize values, seed lookup rows. | `alembic revision -m "..."` (empty), then write Python in `upgrade()` / `downgrade()`. |

Often a single PR has both — e.g. add a `slug` column (schema) then populate it from existing names (data). It is fine to keep them in **one** migration file; just make sure both `upgrade` and `downgrade` are reversible.

### Daily commands

All commands assume Docker Compose. For native, drop the `docker compose run --rm api` prefix and use `uv run` directly.

```bash
# show current state
docker compose run --rm api uv run alembic current        # which revision is the DB at?
docker compose run --rm api uv run alembic history        # full revision graph
docker compose run --rm api uv run alembic heads          # tips of each branch (should be 1)

# generate
docker compose run --rm api uv run alembic revision --autogenerate -m "add slug to users"
docker compose run --rm api uv run alembic revision -m "backfill user slugs"    # empty (for data migrations)

# apply
docker compose run --rm api uv run alembic upgrade head        # all pending
docker compose run --rm api uv run alembic upgrade +1          # exactly one step
docker compose run --rm api uv run alembic upgrade <revision>  # to a specific revision

# roll back
docker compose run --rm api uv run alembic downgrade -1        # one step back
docker compose run --rm api uv run alembic downgrade <revision>
docker compose run --rm api uv run alembic downgrade base      # all the way back (drops everything)

# adopt an existing DB without running migrations
docker compose run --rm api uv run alembic stamp head          # mark DB as up-to-date

# branch conflicts (rare — two devs generated revisions in parallel)
docker compose run --rm api uv run alembic merge -m "merge x and y" <revA> <revB>
```

Generated migration files appear in `backend/alembic/versions/` on your host because that directory is bind-mounted into the container.

### Authoring a schema migration

1. Edit a model in `app/features/<x>/models.py`.
2. `docker compose run --rm api uv run alembic revision --autogenerate -m "<concise message>"`.
3. **Open the new file** in `alembic/versions/`. Autogenerate is good but not perfect:
   - **Column renames** are detected as drop + add → data loss. Fix manually with `op.alter_column(..., new_column_name=...)`.
   - **Check constraints** are sometimes missed.
   - **Server defaults** changes are sometimes missed.
   - **Reordering columns** isn't detected (and doesn't matter in Postgres).
4. `docker compose up -d` — the container runs `upgrade head` automatically.
5. `docker compose run --rm api uv run alembic current` — confirm.
6. Commit both the model change and the migration file.

### Authoring a data migration

```bash
docker compose run --rm api uv run alembic revision -m "backfill user slugs"
```

Edit the generated file:

```python
from alembic import op
import sqlalchemy as sa

revision = "abc123def456"
down_revision = "prev_revision_id"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Option 1 — raw SQL when it's simple
    op.execute("UPDATE users SET slug = lower(first_name || '-' || last_name) WHERE slug IS NULL")

    # Option 2 — SQLAlchemy core when it's not (joins, conditions, batching)
    bind = op.get_bind()
    users = sa.table("users", sa.column("id", sa.Integer), sa.column("slug", sa.String))
    bind.execute(users.update().where(users.c.slug.is_(None)).values(slug="..."))


def downgrade() -> None:
    op.execute("UPDATE users SET slug = NULL")
```

Rules:

- **Never import your ORM models** in a migration. Use raw SQL or `sa.table()` lightweight tables — models in `app/` will keep evolving, and an old migration would break the day someone removes a column.
- **Both `upgrade` and `downgrade` must work**. If a data change is truly irreversible, document it with a clear comment and `raise NotImplementedError("downgrade not supported: ...")`.
- **Batch large updates**. For multi-million-row backfills, chunk with `LIMIT/OFFSET` or by id range — don't do it in one transaction.

### What never to do

- ❌ Edit a migration file that's already been merged to main. Generate a new one instead.
- ❌ Run `alembic stamp` on a database with real data unless you're absolutely sure the schema matches.
- ❌ Use `from app.features... import ...` inside a migration. The migration runs against historical schema; the import would couple it to current code.
- ❌ Skip the `downgrade()` body — write it even if you hope you'll never use it.

---

## Seed data

Seeding is **separate from migrations**. Migrations evolve the schema;
seeds populate the schema with the rows your app needs to function (first
admin, system roles, lookup tables, …).

We use a tiny CLI in `app/cli.py`. Run it via `python -m app.cli`.

### `seed-admin` — bootstrap the first superuser

Idempotent: re-running is a no-op if the user already exists.

```bash
# Docker workflow (recommended)
docker compose run --rm api uv run python -m app.cli seed-admin
docker compose run --rm api uv run python -m app.cli seed-admin \
  --email me@example.com --password 'My$ecret123!' \
  --first-name Stephen --last-name Kyaw

# Native workflow
uv run python -m app.cli seed-admin

# CI / fresh deploy — env vars override the defaults
SEED_ADMIN_EMAIL=admin@openhrcore.local \
SEED_ADMIN_PASSWORD='ChangeMe123!' \
  uv run python -m app.cli seed-admin
```

Defaults come from environment variables, then a hard-coded fallback. The
defaults are intentionally weak — **change the password immediately in any
shared environment**.

### Adding more seed commands

Open `app/cli.py` and add a subparser + an async function. Pattern:

```python
async def seed_<thing>(...):
    async with AsyncSessionLocal() as db:
        ...  # use repositories/services like any other code path
        await db.commit()
```

Seeds use the same `UserService` / `UserRepository` as the API — there is no
shadow "seed" code path. That way a bug in the API is also caught by the
seed, and vice versa.

### Seeds vs data migrations

| Use a **seed** when | Use a **data migration** when |
| --- | --- |
| You're populating *idempotent* baseline rows (system roles, default admin, lookup tables). | You're backfilling a column you just added in the same PR. |
| It's safe to skip if the rows already exist. | It must run exactly once per environment, in lockstep with a schema change. |
| The data may legitimately differ between dev / staging / prod. | The data is part of the canonical schema state. |

Seeds run on every deploy and can be re-run safely. Data migrations run once,
via Alembic's normal version-tracking.

---

## Testing

Three tiers, by isolation and speed:

| Tier | Directory | Hits the DB? | Goes through HTTP? | Use for |
| --- | --- | --- | --- | --- |
| **unit**        | `tests/unit/`        | no  | no  | pure-logic checks: schemas, validators, parsers, hashing. Fast. |
| **functional**  | `tests/functional/`  | yes | no  | business rules in services + repository against real Postgres. |
| **integration** | `tests/integration/` | yes | yes | full FastAPI stack via `httpx.AsyncClient`: status codes, response shapes, headers. |

### How isolation works

- A separate database, `openhrcore_test`, is used (created once with
  `createdb openhrcore_test` or the command in `From zero on a new laptop` below).
- The `_prepare_schema` session fixture in `tests/conftest.py` runs
  `Base.metadata.create_all()` once at the start of the test session and
  drops it at the end. (Tests target the ORM models, not migrations —
  migration correctness is its own concern.)
- The `db` fixture truncates every table at the start of each test —
  cheaper than the savepoint-restart dance and easier to reason about.
- The `client` fixture overrides the `db_session` dependency so each HTTP
  request in a test opens its own short-lived session, mirroring prod.

### Running tests

```bash
# one-time: create the test database
docker compose exec db createdb -U openhrcore openhrcore_test

# Docker (recommended — matches CI exactly)
docker compose run --rm \
  -e TEST_DATABASE_URL=postgresql+asyncpg://openhrcore:openhrcore@db:5432/openhrcore_test \
  api uv run pytest

# Native (if you also run Postgres locally)
TEST_DATABASE_URL=postgresql+asyncpg://openhrcore:openhrcore@localhost:5432/openhrcore_test \
  uv run pytest

# common flags
uv run pytest tests/unit                  # only the fast tier
uv run pytest -k user                     # filter by test name
uv run pytest -xvs                        # stop on first failure, verbose
uv run pytest --lf                        # rerun last failures
uv run pytest -m functional               # by marker
```

If `TEST_DATABASE_URL` is unset, the conftest derives it by suffixing the
dev DB name with `_test`.

### Writing tests for a new feature

For each new feature `app/features/<x>/`, mirror the structure under `tests/`:

```
tests/
  unit/features/<x>/
    test_schema.py             # validators, normalisation
    test_compile_filters.py    # filter spec → SQL clauses
  functional/features/<x>/
    test_<x>_service.py        # service against real DB
  integration/features/<x>/
    test_<x>_api.py            # full HTTP stack
```

Use the `user` feature's tests as the template. The fixtures in
`tests/conftest.py` (`db`, `client`) are all you need.

---

## Run

Docker Compose runs uvicorn for you. To run on the host directly:

```bash
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API docs (Swagger): <http://localhost:8000/api/v1/docs>
- ReDoc: <http://localhost:8000/api/v1/redoc>
- Liveness: <http://localhost:8000/health/live>
- Readiness: <http://localhost:8000/health/ready>

---

## Developer tooling

This project uses **uv + ruff + mypy + pytest**. All four ship under
`uv sync` — no separate global installs.

### uv (package + venv manager)

Replaces pip, venv, pip-tools, pipx in one binary. Written in Rust.
Resolves and installs deps ~10× faster than pip.

```bash
# add / remove
uv add <package>                    # runtime dep
uv add --dev <package>              # dev-only dep
uv remove <package>

# locks + installs
uv sync                             # install exactly what uv.lock says
uv sync --upgrade                   # bump everything to latest allowed, then install
uv lock --upgrade                   # bump lock without touching .venv
uv lock --upgrade-package fastapi   # bump one package

# run anything in the project venv
uv run <command>                    # e.g. uv run pytest
uv run python                       # interactive REPL with the project's Python

# python version
uv python list                      # show installed + downloadable versions
uv python install 3.14               # install a specific version
```

**`uv.lock` is committed to git.** Every machine resolves to the exact
same versions; CI never gets a surprise upgrade.

### ruff (linter + formatter)

Ruff replaces flake8, black, isort, pyupgrade, pylint (partially), bandit
(partially) — one tool, one config block, ~300ms on this codebase.

Config lives in `pyproject.toml`:

```toml
[tool.ruff]
line-length = 100
target-version = "py313"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "N", "SIM"]
ignore = ["B008"]                  # FastAPI Depends() in default args is fine
```

| Code group | What it catches |
| --- | --- |
| `E` | pycodestyle errors (whitespace, indentation) |
| `F` | pyflakes (unused imports, undefined names) |
| `I` | isort (import ordering) |
| `B` | flake8-bugbear (likely bugs) |
| `UP` | pyupgrade (modernize syntax — uses `target-version`) |
| `N` | pep8-naming (`PascalCase`, `snake_case`, etc.) |
| `SIM` | flake8-simplify (`if x == True` → `if x`) |

Day-to-day:

```bash
uv run ruff check .                  # report violations
uv run ruff check --fix .            # auto-fix what's fixable
uv run ruff format .                 # reformat (Black-compatible)
uv run ruff format --check .         # CI mode — exits 1 if anything would change
uv run ruff rule UP046               # explain a specific rule
```

**Before every commit:**

```bash
uv run ruff check --fix . && uv run ruff format .
```

### mypy (static type checker)

```bash
uv run mypy app                      # type-check the whole app/ tree
uv run mypy app/features/user        # one feature at a time while iterating
```

All code is fully type-annotated. New code should also be.

### pytest

```bash
uv run pytest                        # run all tests
uv run pytest -k user                # filter by name
uv run pytest -xvs                   # stop on first failure, verbose, no capture
uv run pytest --lf                   # rerun last failures only
```

Async tests just work — `pyproject.toml` sets `asyncio_mode = "auto"` so
you write `async def test_…(): ...` with no decorator.

### Editor setup

**VS Code** — install the [Ruff extension](https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff)
and add to your workspace settings:

```jsonc
{
  "editor.formatOnSave": true,
  "[python]": { "editor.defaultFormatter": "charliermarsh.ruff" },
  "editor.codeActionsOnSave": {
    "source.fixAll.ruff": "explicit",
    "source.organizeImports.ruff": "explicit"
  },
  "python.defaultInterpreterPath": "${workspaceFolder}/backend/.venv/bin/python"
}
```

**PyCharm** — install the official Ruff plugin from the marketplace,
point the project interpreter to `backend/.venv/bin/python`.

**Neovim** — `ruff-lsp` via Mason, or `conform.nvim` for format-on-save.

### Pre-commit hooks (optional but recommended)

`.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.15.13
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
```

Then:

```bash
uv add --dev pre-commit
uv run pre-commit install
```

Now `git commit` runs ruff first and aborts if anything's unfixable.

---

## Python conventions

These are the rules the codebase follows. The `user/` feature is the
reference — every rule below is illustrated there.

### Naming

- `snake_case` for variables, functions, methods, modules.
- `PascalCase` for classes.
- `UPPER_SNAKE` for module-level constants.
- `_leading_underscore` for "private" helpers and mixins.
- Booleans: `is_*`, `has_*`, `can_*`, `should_*`.
- **No builtin shadows**: never use `id`, `list`, `filter`, `type`, `dict`, `next`, `input` as variable names. Use `entity_id`, `items`, `filters`, etc.

### Type hints

- Every public function / method is annotated, including return type.
- Use modern syntax (`list[str]`, `str | None`) — `target-version = "py313"`
  enforces it via ruff `UP` rules.
- Generic classes use PEP 695 syntax: `class Page[T](BaseModel)`, not
  `class Page(BaseModel, Generic[T])`.

### Async

- I/O-bound code is `async def`. CPU-bound work (password hashing, parsing) stays sync — never `await` on it.
- Never call blocking I/O from an async function (e.g. `requests.get`). Use
  `httpx.AsyncClient`, `aiofiles`, etc.

### Imports

- Group order: stdlib, third-party, first-party (`app.*`). Ruff's `I` rule enforces this on save.
- Avoid `from foo import *`.
- Avoid `from __future__ import annotations` in modules FastAPI introspects
  (`router.py`, `deps.py`, `main.py`) — it stringifies `Annotated[..., Query(...)]`
  and breaks Pydantic v2's metadata extraction.

### Docstrings

- Every module has a top-of-file docstring (one paragraph max).
- Every public class has a docstring; describe role, collaborators, invariants.
- Public methods have one-line summaries; add `Args/Returns/Raises` when non-obvious.
- Comments explain **why**, never **what**.

### Logging

- `log = get_logger(__name__)` per module — never the root logger.
- One INFO log per state change with `key=value` pairs.
- WARNING for recoverable conflicts; ERROR is handled by the global exception handler.

### Errors

- Services raise `NotFoundError`, `ConflictError`, etc. from `core.exceptions`.
- Routes don't `try/except` — let the global handler do its job.

### Transactions

- One session per request, committed by `core.database.get_db`.
- Repositories `flush`; nothing else commits.

### Tests

- Mirror the source tree: `tests/features/user/test_service.py` etc.
- Async tests don't need a decorator (`asyncio_mode = "auto"`).
- Each test owns its data setup — no shared fixtures with hidden state.

---

## Adding a new feature

1. `cp -r app/features/user app/features/<name>` and rename `User` → `<Name>` throughout.
2. Update `models.py` with the new table.
3. Update `schema.py` with the new fields and filters.
4. Update `repository.py`: change `model`, `sortable_fields`, `default_order_by`, `compile_filters`.
5. Update `service.py` with the business rules; same method shape.
6. Update `deps.py` and `router.py`: trivial renames.
7. Register models in `app/models_registry.py`.
8. Include the router in `app/api/v1/router.py`.
9. `uv run alembic revision --autogenerate -m "<name>"` then `uv run alembic upgrade head`.
10. `uv run ruff check --fix . && uv run ruff format .` before committing.

The file structure and the rules in the docstrings won't change — just
the names. That's the point of a template.

---

## Command cheat sheet

Everything below assumes you're at the **repo root** (one directory up from `backend/`) for `docker compose ...`, and inside `backend/` for plain `uv run ...`.

### Docker Compose

```bash
# bring stack up / down
docker compose up -d                         # start everything
docker compose up -d db                      # only Postgres
docker compose down                          # stop, keep data
docker compose down -v                       # stop and wipe DB volume

# observe
docker compose ps                            # what's running
docker compose logs -f api                   # tail API logs
docker compose logs -f db                    # tail DB logs

# operate
docker compose exec api bash                 # shell in API container
docker compose exec db psql -U openhrcore    # psql in DB container
docker compose restart api                   # reload after compose/env change
docker compose build api                     # rebuild after Dockerfile / lockfile change
```

### Alembic (inside Docker)

```bash
docker compose run --rm api uv run alembic current
docker compose run --rm api uv run alembic history
docker compose run --rm api uv run alembic revision --autogenerate -m "<msg>"
docker compose run --rm api uv run alembic revision -m "<msg>"          # empty (data migration)
docker compose run --rm api uv run alembic upgrade head
docker compose run --rm api uv run alembic upgrade +1
docker compose run --rm api uv run alembic downgrade -1
docker compose run --rm api uv run alembic downgrade base
docker compose run --rm api uv run alembic stamp head                   # adopt existing DB
```

### Alembic (native, host venv)

```bash
uv run alembic current
uv run alembic history
uv run alembic revision --autogenerate -m "<msg>"
uv run alembic revision -m "<msg>"
uv run alembic upgrade head
uv run alembic upgrade +1
uv run alembic downgrade -1
uv run alembic downgrade base
uv run alembic stamp head
```

### uv

```bash
uv sync                                       # install from uv.lock
uv sync --upgrade                             # bump everything to latest
uv add <pkg>                                  # add runtime dep
uv add --dev <pkg>                            # add dev dep
uv remove <pkg>
uv lock --upgrade-package fastapi             # bump one package
uv run <command>                              # run anything in the project venv
uv python list                                # list Python versions
```

### Quality / tests

```bash
uv run ruff check --fix . && uv run ruff format .   # before every commit
uv run ruff check .                                 # report only
uv run ruff format --check .                        # CI mode
uv run mypy app
uv run pytest                                       # all tiers
uv run pytest tests/unit                            # fast tier only
uv run pytest -k user                               # filter by name
uv run pytest -m functional                         # by marker
uv run pytest -xvs                                  # stop on first failure
```

### Seed / CLI

```bash
# Docker
docker compose run --rm api uv run python -m app.cli seed-admin
docker compose run --rm api uv run python -m app.cli seed-admin --email me@example.com --password '...'

# native
uv run python -m app.cli seed-admin

# one-time test DB creation
docker compose exec db createdb -U openhrcore openhrcore_test
```

### Server

```bash
# inside Docker (compose already does this)
docker compose up -d

# native
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# health
curl http://localhost:8000/health/live
curl http://localhost:8000/health/ready
```
