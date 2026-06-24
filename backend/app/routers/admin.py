from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.models import (
    Booking,
    CreateEventTypeRequest,
    ErrorBody,
    EventType,
    PageResponse,
    UpdateEventTypeRequest,
)
from app.storage import InMemoryStorage
from app.dependencies import get_storage

router = APIRouter(prefix="/api/admin")


@router.get(
    "/event-types",
    response_model=PageResponse[EventType],
    responses={400: {"model": ErrorBody}},
    operation_id="AdminEventTypes_list",
)
def list_event_types(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    storage: InMemoryStorage = Depends(get_storage),
):
    data, total = storage.list_event_types(page, limit)
    return PageResponse(data=data, total=total, page=page, limit=limit)


@router.post(
    "/event-types",
    response_model=EventType,
    status_code=201,
    responses={400: {"model": ErrorBody}, 422: {"model": ErrorBody}},
    operation_id="AdminEventTypes_create",
)
def create_event_type(
    body: CreateEventTypeRequest,
    storage: InMemoryStorage = Depends(get_storage),
):
    return storage.create_event_type(body)


@router.put(
    "/event-types/{event_type_id}",
    response_model=EventType,
    responses={400: {"model": ErrorBody}, 404: {"model": ErrorBody}, 422: {"model": ErrorBody}},
    operation_id="AdminEventTypes_update",
)
def update_event_type(
    event_type_id: int,
    body: UpdateEventTypeRequest,
    storage: InMemoryStorage = Depends(get_storage),
):
    et = storage.update_event_type(event_type_id, body)
    if et is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=ErrorBody(code="NOT_FOUND", message="Event type not found").model_dump())
    return et


@router.delete(
    "/event-types/{event_type_id}",
    status_code=204,
    responses={404: {"model": ErrorBody}},
    operation_id="AdminEventTypes_delete",
)
def delete_event_type(
    event_type_id: int,
    storage: InMemoryStorage = Depends(get_storage),
):
    deleted = storage.delete_event_type(event_type_id)
    if not deleted:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=ErrorBody(code="NOT_FOUND", message="Event type not found").model_dump())


@router.get(
    "/bookings",
    response_model=PageResponse[Booking],
    responses={400: {"model": ErrorBody}},
    operation_id="AdminBookings_list",
)
def list_bookings(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    storage: InMemoryStorage = Depends(get_storage),
):
    data, total = storage.list_bookings(page, limit)
    return PageResponse(data=data, total=total, page=page, limit=limit)
