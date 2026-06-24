from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class BookingStatus(str, Enum):
    confirmed = "confirmed"
    cancelled = "cancelled"


class EventType(BaseModel):
    id: int
    title: str
    description: str
    duration: int


class CreateEventTypeRequest(BaseModel):
    title: str
    description: str
    duration: int = 30


class UpdateEventTypeRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[int] = None


class Booking(BaseModel):
    id: int
    eventTypeId: int
    guestName: str
    guestEmail: Optional[str] = None
    startTime: datetime
    endTime: datetime
    status: BookingStatus
    createdAt: datetime


class CreateBookingRequest(BaseModel):
    eventTypeId: int
    guestName: str
    guestEmail: Optional[str] = None
    startTime: datetime


class Slot(BaseModel):
    startTime: datetime
    endTime: datetime


class ErrorBody(BaseModel):
    code: str
    message: str
    details: Optional[List[str]] = None


class PageResponse(BaseModel, Generic[T]):
    data: List[T]
    total: int
    page: int
    limit: int
