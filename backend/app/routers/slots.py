from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.models import ErrorBody, Slot
from app.services import generate_slots, SLOT_WINDOW_DAYS
from app.storage import InMemoryStorage
from app.dependencies import get_storage

router = APIRouter()


@router.get(
    "/api/event-types/{event_type_id}/slots",
    response_model=list[Slot],
    responses={400: {"model": ErrorBody}, 404: {"model": ErrorBody}},
    operation_id="Slots_list",
)
def list_slots(
    event_type_id: int,
    date_param: Optional[str] = Query(None, alias="date"),
    storage: InMemoryStorage = Depends(get_storage),
):
    et = storage.get_event_type(event_type_id)
    if et is None:
        raise HTTPException(
            status_code=404,
            detail=ErrorBody(code="NOT_FOUND", message="Event type not found").model_dump(),
        )

    today = datetime.now().date()

    if date_param:
        try:
            target_date = date.fromisoformat(date_param)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=ErrorBody(code="INVALID_DATE", message="Invalid date format, use YYYY-MM-DD").model_dump(),
            )
        if target_date < today or target_date > today + timedelta(days=SLOT_WINDOW_DAYS - 1):
            return []
    else:
        target_date = today

    day_start = datetime(target_date.year, target_date.month, target_date.day)
    day_end = day_start + timedelta(days=1)
    existing_bookings = storage.get_bookings_in_range(day_start, day_end)
    slots = generate_slots(et, target_date, existing_bookings)
    return slots
