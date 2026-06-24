from __future__ import annotations

from datetime import datetime
from threading import Lock
from typing import Dict, List, Optional, Tuple

from app.models import Booking, BookingStatus, CreateEventTypeRequest, EventType, UpdateEventTypeRequest


class InMemoryStorage:
    def __init__(self) -> None:
        self._lock = Lock()
        self._event_types: Dict[int, EventType] = {}
        self._event_types_next_id: int = 1
        self._bookings: Dict[int, Booking] = {}
        self._bookings_next_id: int = 1

    def create_event_type(self, req: CreateEventTypeRequest) -> EventType:
        with self._lock:
            et = EventType(
                id=self._event_types_next_id,
                title=req.title,
                description=req.description,
                duration=req.duration,
            )
            self._event_types[et.id] = et
            self._event_types_next_id += 1
            return et

    def get_event_type(self, event_type_id: int) -> Optional[EventType]:
        return self._event_types.get(event_type_id)

    def list_event_types(self, page: int, limit: int) -> Tuple[List[EventType], int]:
        all_items = list(self._event_types.values())
        total = len(all_items)
        start = (page - 1) * limit
        end = start + limit
        return all_items[start:end], total

    def update_event_type(self, event_type_id: int, req: UpdateEventTypeRequest) -> Optional[EventType]:
        with self._lock:
            et = self._event_types.get(event_type_id)
            if et is None:
                return None
            if req.title is not None:
                et.title = req.title
            if req.description is not None:
                et.description = req.description
            if req.duration is not None:
                et.duration = req.duration
            self._event_types[event_type_id] = et
            return et

    def delete_event_type(self, event_type_id: int) -> bool:
        with self._lock:
            if event_type_id not in self._event_types:
                return False
            del self._event_types[event_type_id]
            return True

    def create_booking(
        self,
        event_type_id: int,
        guest_name: str,
        guest_email: str,
        start_time: datetime,
        end_time: datetime,
    ) -> Booking:
        with self._lock:
            for existing in self._bookings.values():
                if existing.status == BookingStatus.confirmed:
                    if existing.startTime < end_time and existing.endTime > start_time:
                        raise SlotAlreadyBookedError(
                            f"Slot {start_time.isoformat()} - {end_time.isoformat()} is already booked"
                        )
            booking = Booking(
                id=self._bookings_next_id,
                eventTypeId=event_type_id,
                guestName=guest_name,
                guestEmail=guest_email,
                startTime=start_time,
                endTime=end_time,
                status=BookingStatus.confirmed,
                createdAt=datetime.now(),
            )
            self._bookings[booking.id] = booking
            self._bookings_next_id += 1
            return booking

    def list_bookings(self, page: int, limit: int) -> Tuple[List[Booking], int]:
        all_items = list(self._bookings.values())
        all_items.sort(key=lambda b: b.startTime)
        total = len(all_items)
        start = (page - 1) * limit
        end = start + limit
        return all_items[start:end], total

    def get_bookings_in_range(self, start: datetime, end: datetime) -> List[Booking]:
        result = []
        for b in self._bookings.values():
            if b.status == BookingStatus.confirmed and b.startTime < end and b.endTime > start:
                result.append(b)
        return result


class SlotAlreadyBookedError(Exception):
    pass
