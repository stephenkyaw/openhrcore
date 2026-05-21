"""User feature — admin-side CRUD over the ``users`` table.

This package is the reference template for every other feature. The public
surface re-exported here is what other code should import:

* :data:`router` — mount in ``app/api/v1/router.py``.
* :class:`UserService` — inject into other services that need user data.
* :class:`User` — the ORM model, used in cross-feature relationships.

Everything else (schemas, repository, deps) is feature-internal. Reach into
``app.features.user.schema`` etc. only from inside this feature or from tests.
"""

from app.features.user.models import User
from app.features.user.router import router
from app.features.user.service import UserService

__all__ = ["User", "UserService", "router"]
