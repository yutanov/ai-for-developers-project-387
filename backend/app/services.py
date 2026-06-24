from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import List, Optional

import pytz

from app.models import Booking, EventType, Slot
from app.storage import SlotAlreadyBookedError

MSK_TZ = pytz.timezone("Europe/Moscow")
SLOT_WINDOW_DAYS = 14
WORK_HOURS_START = 9
WORK_HOURS_END = 18


def generate_slots(
    event_type: EventType,
    target_date: date,
    existing_bookings: List[Booking],
) -> List[Slot]:
    now_utc = datetime.now(pytz.UTC)
    slots: List[Slot] = []
    day_start = MSK_TZ.localize(
        datetime(target_date.year, target_date.month, target_date.day, WORK_HOURS_START, 0, 0)
    )
    day_end = MSK_TZ.localize(
        datetime(target_date.year, target_date.month, target_date.day, WORK_HOURS_END, 0, 0)
    )
    current = day_start
    while current + timedelta(minutes=event_type.duration) <= day_end:
        slot_start_utc = current.astimezone(pytz.UTC).replace(tzinfo=None)
        slot_end_utc = (current + timedelta(minutes=event_type.duration)).astimezone(pytz.UTC).replace(tzinfo=None)
        if slot_start_utc <= now_utc.replace(tzinfo=None):
            current += timedelta(minutes=event_type.duration)
            continue
        slot = Slot(startTime=slot_start_utc, endTime=slot_end_utc)
        if not _is_slot_booked(slot, existing_bookings):
            slots.append(slot)
        current += timedelta(minutes=event_type.duration)
    return slots


def _is_slot_booked(slot: Slot, existing_bookings: List[Booking]) -> bool:
    for b in existing_bookings:
        if b.startTime < slot.endTime and b.endTime > slot.startTime:
            return True
    return False


def calculate_end_time(start_time: datetime, duration_minutes: int) -> datetime:
    return start_time + timedelta(minutes=duration_minutes)
