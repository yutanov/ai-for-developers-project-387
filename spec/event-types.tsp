using TypeSpec.Http;
using TypeSpec.Rest;

@route("/api/admin/event-types")
namespace CalendarBooking.AdminEventTypes {
  @get
  op list(...Pagination): PageResponse<EventType> | BadRequest;

  @post
  op create(@body createEventTypeRequest: CreateEventTypeRequest): {
    @statusCode _: 201;
    @body eventType: EventType;
  } | BadRequest | UnprocessableEntity;

  @put
  op update(@path id: int64, @body updateEventTypeRequest: UpdateEventTypeRequest): EventType | NotFound | BadRequest | UnprocessableEntity;

  @delete
  op delete(@path id: int64): {
    @statusCode _: 204;
  } | NotFound;
}

@route("/api/event-types")
namespace CalendarBooking.PublicEventTypes {
  @get
  op list(...Pagination): PageResponse<EventType> | BadRequest;
}
