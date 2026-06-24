from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.models import ErrorBody, EventType, PageResponse
from app.storage import InMemoryStorage
from app.dependencies import get_storage

router = APIRouter()


@router.get(
    "/api/event-types",
    response_model=PageResponse[EventType],
    responses={400: {"model": ErrorBody}},
    operation_id="PublicEventTypes_list",
)
def list_event_types(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    storage: InMemoryStorage = Depends(get_storage),
):
    data, total = storage.list_event_types(page, limit)
    return PageResponse(data=data, total=total, page=page, limit=limit)
