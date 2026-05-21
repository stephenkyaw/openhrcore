"""Operational CLI — run with ``uv run python -m app.cli <command>``.

Commands:
    seed-admin   Idempotently create a superuser. Useful on first boot
                 (new laptop, fresh deploy, CI integration tests).

This is intentionally tiny — no Click/Typer dependency. Argparse is enough.
"""

import argparse
import asyncio
import os
import sys

from app.core.database import AsyncSessionLocal
from app.core.logging import get_logger, setup_logging
from app.features.user.repository import UserRepository
from app.features.user.schema import UserCreate
from app.features.user.service import UserService

log = get_logger("app.cli")


async def seed_admin(
    email: str, password: str, first_name: str, last_name: str
) -> None:
    """Create the first superuser. Idempotent — re-runs are no-ops."""
    email = email.lower()
    async with AsyncSessionLocal() as db:
        repo = UserRepository(db)
        if await repo.email_exists(email):
            log.info("seed.admin.skip email=%s reason=exists", email)
            print(f"User '{email}' already exists — skipping.", file=sys.stderr)
            return

        service = UserService(db)
        user = await service.create(
            UserCreate(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_active=True,
                is_superuser=True,
            )
        )
        await db.commit()
        print(f"Created superuser '{user.email}' (id={user.id})")


def main() -> None:
    setup_logging("INFO")
    parser = argparse.ArgumentParser(prog="app.cli")
    sub = parser.add_subparsers(dest="cmd", required=True)

    seed = sub.add_parser("seed-admin", help="Create the first superuser (idempotent).")
    seed.add_argument(
        "--email", default=os.environ.get("SEED_ADMIN_EMAIL", "admin@openhrcore.local")
    )
    seed.add_argument(
        "--password", default=os.environ.get("SEED_ADMIN_PASSWORD", "ChangeMe123!")
    )
    seed.add_argument(
        "--first-name", default=os.environ.get("SEED_ADMIN_FIRST_NAME", "Super")
    )
    seed.add_argument(
        "--last-name", default=os.environ.get("SEED_ADMIN_LAST_NAME", "Admin")
    )

    args = parser.parse_args()
    if args.cmd == "seed-admin":
        asyncio.run(
            seed_admin(args.email, args.password, args.first_name, args.last_name)
        )


if __name__ == "__main__":
    main()
