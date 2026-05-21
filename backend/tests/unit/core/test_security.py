"""Unit tests for password hashing primitives."""

import pytest

from app.core.security import hash_password, needs_rehash, verify_password

pytestmark = pytest.mark.unit


def test_hash_returns_argon2id_envelope() -> None:
    hashed = hash_password("password123")
    assert hashed.startswith("$argon2")
    # argon2-cffi uses the id variant by default
    assert "$argon2id$" in hashed


def test_hash_is_nondeterministic() -> None:
    a = hash_password("same-input")
    b = hash_password("same-input")
    assert a != b  # different salts every call


def test_verify_correct_password() -> None:
    hashed = hash_password("correct horse battery staple")
    assert verify_password("correct horse battery staple", hashed) is True


def test_verify_wrong_password() -> None:
    hashed = hash_password("correct password")
    assert verify_password("wrong password", hashed) is False


def test_verify_handles_garbage_hash() -> None:
    # Should never raise — caller wants a bool.
    assert verify_password("anything", "not-an-argon2-hash") is False


def test_needs_rehash_false_for_fresh_hash() -> None:
    assert needs_rehash(hash_password("x")) is False
