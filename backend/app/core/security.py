"""Password hashing.

Uses ``argon2-cffi`` directly (the Argon2id reference implementation).
We do *not* depend on passlib — it has not had a release since 2020.

``PasswordHasher`` is thread-safe and immutable, so a single module-level
instance is fine; it carries the cost-parameter defaults (time/memory/parallelism)
that argon2-cffi maintains as best-practice for the year of release.
"""

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """Return an Argon2id hash for the given plaintext password."""
    return _hasher.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Return ``True`` iff ``plain`` matches the previously-stored ``hashed``."""
    try:
        return _hasher.verify(hashed, plain)
    except (VerifyMismatchError, InvalidHashError):
        return False


def needs_rehash(hashed: str) -> bool:
    """Return ``True`` if ``hashed`` was produced with weaker parameters.

    Call after a successful :func:`verify_password` to opportunistically
    upgrade hashes when the library's defaults change. Cheap, no I/O.
    """
    return _hasher.check_needs_rehash(hashed)
