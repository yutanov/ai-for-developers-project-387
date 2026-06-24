from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException

from app.models import Booking, CreateBookingRequest, ErrorBody
from app.services import calculate_end_time, SLOT_WINDOW_DAYS
from app.storage import InMemoryStorage, SlotAlreadyBookedError
from app.dependencies import get_storage

router = APIRouter()


@router.post(
    "/api/bookings",
    response_model=Booking,
    status_code=201,
    responses={
        400: {"model": ErrorBody},
        404: {"model": ErrorBody},
        409: {"model": ErrorBody},
        422: {"model": ErrorBody},
    },
    operation_id="GuestBookings_create",
)
def create_booking(
    body: CreateBookingRequest,
    storage: InMemoryStorage = Depends(get_storage),
):
    et = storage.get_event_type(body.eventTypeId)
    if et is None:
        raise HTTPException(
            status_code=404,
            detail=ErrorBody(code="NOT_FOUND", message="Event type not found").model_dump(),
        )

    now = datetime.now()
    if body.startTime < now:
        raise HTTPException(
            status_code=422,
            detail=ErrorBody(
                code="INVALID_START_TIME",
                message="Start time must be in the future",
            ).model_dump(),
        )

    window_end = now + timedelta(days=SLOT_WINDOW_DAYS)
    if body.startTime > window_end:
        raise HTTPException(
            status_code=422,
            detail=ErrorBody(
                code="OUT_OF_BOOKING_WINDOW",
                message=f"Booking must be within {SLOT_WINDOW_DAYS} days from now",
            ).model_dump(),
        )

    end_time = calculate_end_time(body.startTime, et.duration)

    try:
        booking = storage.create_booking(
            event_type_id=body.eventTypeId,
            guest_name=body.guestName,
            guest_email=body.guestEmail,
            start_time=body.startTime,
            end_time=end_time,
        )
    except SlotAlreadyBookedError:
        raise HTTPException(
            status_code=409,
            detail=ErrorBody(
                code="SLOT_ALREADY_BOOKED",
                message="The requested time slot is already booked",
            ).model_dump(),
        )

    return booking
