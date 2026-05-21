"""Imports every ORM model so SQLAlchemy's metadata is fully populated.

Used by Alembic (env.py). Add a new line each time a feature introduces models.
"""

from app.features.user import models as user_models  # noqa: F401
