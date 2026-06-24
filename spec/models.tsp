using TypeSpec.Http;

enum BookingStatus {
  confirmed,
  cancelled,
}

model EventType {
  id: int64;
  title: string;
  description: string;
  duration: int32;
}

model Booking {
  id: int64;
  eventTypeId: int64;
  guestName: string;
  guestEmail?: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  status: BookingStatus;
  createdAt: utcDateTime;
}

model Slot {
  startTime: utcDateTime;
  endTime: utcDateTime;
}

model CreateEventTypeRequest {
  title: string;
  description: string;
  duration?: int32;
}

model UpdateEventTypeRequest {
  title?: string;
  description?: string;
  duration?: int32;
}

model CreateBookingRequest {
  eventTypeId: int64;
  guestName: string;
  guestEmail?: string;
  startTime: utcDateTime;
}

model Pagination {
  @query page?: int32;
  @query limit?: int32;
}

model PageResponse<T> {
  data: T[];
  total: int32;
  page: int32;
  limit: int32;
}

model ErrorBody {
  code: string;
  message: string;
  details?: string[];
}

@error
model BadRequest {
  @statusCode _: 400;
  ...ErrorBody;
}

@error
model NotFound {
  @statusCode _: 404;
  ...ErrorBody;
}

@error
model Conflict {
  @statusCode _: 409;
  ...ErrorBody;
}

@error
model UnprocessableEntity {
  @statusCode _: 422;
  ...ErrorBody;
}
