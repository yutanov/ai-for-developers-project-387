from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient


class TestEventTypes:
    def test_list_event_types_empty(self, client: TestClient):
        resp = client.get("/api/event-types")
        assert resp.status_code == 200
        data = resp.json()
        assert data["data"] == []
        assert data["total"] == 0

    def test_create_event_type(self, client: TestClient):
        resp = client.post(
            "/api/admin/event-types",
            json={"title": "Consultation", "description": "30 min consultation", "duration": 30},
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["title"] == "Consultation"
        assert body["duration"] == 30
        assert body["id"] == 1

    def test_create_event_type_default_duration(self, client: TestClient):
        resp = client.post(
            "/api/admin/event-types",
            json={"title": "Quick chat", "description": "Brief call"},
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["duration"] == 30

    def test_list_event_types_pagination(self, client: TestClient):
        for i in range(5):
            client.post(
                "/api/admin/event-types",
                json={"title": f"Type {i}", "description": f"Desc {i}", "duration": 30},
            )
        resp = client.get("/api/event-types?page=1&limit=2")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) == 2
        assert data["total"] == 5
        assert data["page"] == 1
        assert data["limit"] == 2

    def test_update_event_type(self, client: TestClient):
        et = client.post(
            "/api/admin/event-types",
            json={"title": "Old", "description": "Old desc", "duration": 30},
        ).json()
        resp = client.put(
            f"/api/admin/event-types/{et['id']}",
            json={"title": "Updated", "duration": 60},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["title"] == "Updated"
        assert body["duration"] == 60
        assert body["description"] == "Old desc"

    def test_update_event_type_not_found(self, client: TestClient):
        resp = client.put("/api/admin/event-types/999", json={"title": "Nope"})
        assert resp.status_code == 404

    def test_delete_event_type(self, client: TestClient):
        et = client.post(
            "/api/admin/event-types",
            json={"title": "Delete me", "description": "Bye", "duration": 30},
        ).json()
        resp = client.delete(f"/api/admin/event-types/{et['id']}")
        assert resp.status_code == 204

    def test_delete_event_type_not_found(self, client: TestClient):
        resp = client.delete("/api/admin/event-types/999")
        assert resp.status_code == 404


class TestSlots:
    def test_list_slots_for_event_type(self, client: TestClient, sample_event_type):
        et_id = sample_event_type["id"]
        resp = client.get(f"/api/event-types/{et_id}/slots")
        assert resp.status_code == 200
        slots = resp.json()
        assert len(slots) > 0
        for slot in slots:
            assert "startTime" in slot
            assert "endTime" in slot

    def test_slots_not_found(self, client: TestClient):
        resp = client.get("/api/event-types/999/slots")
        assert resp.status_code == 404

    def test_slots_on_specific_date(self, client: TestClient, sample_event_type):
        et_id = sample_event_type["id"]
        today = datetime.now().strftime("%Y-%m-%d")
        resp = client.get(f"/api/event-types/{et_id}/slots?date={today}")
        assert resp.status_code == 200
        slots = resp.json()
        assert len(slots) > 0

    def test_slots_exclude_booked(self, client: TestClient, sample_event_type):
        et_id = sample_event_type["id"]
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

        slots_resp = client.get(f"/api/event-types/{et_id}/slots?date={tomorrow}")
        assert slots_resp.status_code == 200
        slots = slots_resp.json()
        assert len(slots) > 0

        first_slot = slots[0]
        booking_resp = client.post(
            "/api/bookings",
            json={
                "eventTypeId": et_id,
                "guestName": "Alice",
                "startTime": first_slot["startTime"],
            },
        )
        assert booking_resp.status_code == 201

        slots_after = client.get(f"/api/event-types/{et_id}/slots?date={tomorrow}").json()
        booked_times = [s["startTime"] for s in slots_after]
        assert first_slot["startTime"] not in booked_times


class TestBookings:
    def test_create_booking(self, client: TestClient, sample_event_type):
        et_id = sample_event_type["id"]
        future = (datetime.now() + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        resp = client.post(
            "/api/bookings",
            json={
                "eventTypeId": et_id,
                "guestName": "Bob",
                "guestEmail": "bob@example.com",
                "startTime": future.isoformat(),
            },
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["guestName"] == "Bob"
        assert body["guestEmail"] == "bob@example.com"
        assert body["eventTypeId"] == et_id
        assert body["status"] == "confirmed"

    def test_create_booking_event_type_not_found(self, client: TestClient):
        future = (datetime.now() + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        resp = client.post(
            "/api/bookings",
            json={
                "eventTypeId": 999,
                "guestName": "Bob",
                "startTime": future.isoformat(),
            },
        )
        assert resp.status_code == 404

    def test_create_booking_conflict(self, client: TestClient, sample_event_type):
        et_id = sample_event_type["id"]
        future = (datetime.now() + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)

        resp1 = client.post(
            "/api/bookings",
            json={
                "eventTypeId": et_id,
                "guestName": "Alice",
                "startTime": future.isoformat(),
            },
        )
        assert resp1.status_code == 201

        resp2 = client.post(
            "/api/bookings",
            json={
                "eventTypeId": et_id,
                "guestName": "Bob",
                "startTime": future.isoformat(),
            },
        )
        assert resp2.status_code == 409
        body = resp2.json()
        assert body["code"] == "SLOT_ALREADY_BOOKED"

    def test_list_admin_bookings(self, client: TestClient, sample_event_type):
        et_id = sample_event_type["id"]
        future = (datetime.now() + timedelta(days=1)).replace(hour=11, minute=0, second=0, microsecond=0)
        client.post(
            "/api/bookings",
            json={"eventTypeId": et_id, "guestName": "Charlie", "startTime": future.isoformat()},
        )
        resp = client.get("/api/admin/bookings")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert len(data["data"]) == 1
        assert data["data"][0]["guestName"] == "Charlie"
