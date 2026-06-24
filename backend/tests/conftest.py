from datetime import datetime, timedelta
from typing import Generator

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.storage import InMemoryStorage


@pytest.fixture(autouse=True)
def reset_storage():
    import app.dependencies as deps
    deps._storage = InMemoryStorage()
    yield
    deps._storage = None


@pytest.fixture
def client() -> Generator:
    with TestClient(app) as c:
        yield c


@pytest.fixture
def sample_event_type(client):
    resp = client.post(
        "/api/admin/event-types",
        json={"title": "30 min call", "description": "Quick call", "duration": 30},
    )
    assert resp.status_code == 201
    return resp.json()
