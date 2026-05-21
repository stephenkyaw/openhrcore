"""Integration tests — full FastAPI stack over httpx.AsyncClient."""

from uuid import uuid4

import pytest

pytestmark = pytest.mark.integration


PAYLOAD = {
    "email": "anya@example.com",
    "password": "password123",
    "first_name": "Anya",
    "last_name": "Z",
}


# --------------------------------------------------------------- POST /users
async def test_create_returns_201_with_location_header(client) -> None:
    resp = await client.post("/api/v1/users", json=PAYLOAD)
    assert resp.status_code == 201
    assert resp.headers["Location"].startswith("/api/v1/users/")

    body = resp.json()
    assert body["email"] == "anya@example.com"
    assert "hashed_password" not in body
    assert "password" not in body


async def test_create_duplicate_returns_409_envelope(client) -> None:
    await client.post("/api/v1/users", json=PAYLOAD)
    resp = await client.post("/api/v1/users", json=PAYLOAD)
    assert resp.status_code == 409
    body = resp.json()
    assert body["code"] == "conflict"
    assert "already exists" in body["detail"]


async def test_create_invalid_email_returns_422(client) -> None:
    resp = await client.post(
        "/api/v1/users", json={**PAYLOAD, "email": "not-an-email"}
    )
    assert resp.status_code == 422


async def test_create_short_password_returns_422(client) -> None:
    resp = await client.post("/api/v1/users", json={**PAYLOAD, "password": "short"})
    assert resp.status_code == 422


# ---------------------------------------------------------------- GET /users
async def test_list_paginated_response_shape(client) -> None:
    for i in range(3):
        await client.post(
            "/api/v1/users", json={**PAYLOAD, "email": f"u{i}@example.com"}
        )

    resp = await client.get("/api/v1/users?page=1&page_size=2")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 3
    assert len(body["items"]) == 2
    assert body["page"] == 1
    assert body["page_size"] == 2


async def test_list_search_filter(client) -> None:
    await client.post("/api/v1/users", json={**PAYLOAD, "email": "anya@example.com"})
    await client.post(
        "/api/v1/users",
        json={**PAYLOAD, "email": "bob@example.com", "first_name": "Bob"},
    )
    resp = await client.get("/api/v1/users?search=anya")
    body = resp.json()
    assert body["total"] == 1
    assert body["items"][0]["email"] == "anya@example.com"


async def test_list_invalid_sort_field_returns_400(client) -> None:
    resp = await client.get("/api/v1/users?sort=hashed_password")
    assert resp.status_code == 400


async def test_list_sort_minus_prefix_orders_descending(client) -> None:
    for i in range(3):
        await client.post(
            "/api/v1/users",
            json={**PAYLOAD, "email": f"u{i}@example.com", "first_name": f"U{i}"},
        )
    resp = await client.get("/api/v1/users?sort=-first_name&page_size=10")
    names = [u["first_name"] for u in resp.json()["items"]]
    assert names == sorted(names, reverse=True)


# ----------------------------------------------------------- GET /users/{id}
async def test_get_one_returns_user(client) -> None:
    created = (await client.post("/api/v1/users", json=PAYLOAD)).json()
    resp = await client.get(f"/api/v1/users/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


async def test_get_missing_returns_404_envelope(client) -> None:
    resp = await client.get(f"/api/v1/users/{uuid4()}")
    assert resp.status_code == 404
    body = resp.json()
    assert body["code"] == "not_found"


# --------------------------------------------------------- PATCH /users/{id}
async def test_patch_partial_update(client) -> None:
    created = (await client.post("/api/v1/users", json=PAYLOAD)).json()
    resp = await client.patch(
        f"/api/v1/users/{created['id']}", json={"first_name": "Renamed"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["first_name"] == "Renamed"
    assert body["last_name"] == PAYLOAD["last_name"]


# ----------------------------------------------------- PUT /users/{id}/password
async def test_put_password_returns_204(client) -> None:
    created = (await client.post("/api/v1/users", json=PAYLOAD)).json()
    resp = await client.put(
        f"/api/v1/users/{created['id']}/password",
        json={"password": "brandnewpassword"},
    )
    assert resp.status_code == 204


# -------------------------------------------------------- DELETE /users/{id}
async def test_delete_then_get_returns_404(client) -> None:
    created = (await client.post("/api/v1/users", json=PAYLOAD)).json()
    user_id = created["id"]

    delete_resp = await client.delete(f"/api/v1/users/{user_id}")
    assert delete_resp.status_code == 204

    follow_up = await client.get(f"/api/v1/users/{user_id}")
    assert follow_up.status_code == 404


# ----------------------------------------------------------- health endpoints
async def test_health_live(client) -> None:
    resp = await client.get("/health/live")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


async def test_health_ready(client) -> None:
    resp = await client.get("/health/ready")
    assert resp.status_code == 200
