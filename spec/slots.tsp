using TypeSpec.Http;
using TypeSpec.Rest;

@route("/api/event-types/{eventTypeId}/slots")
namespace CalendarBooking.Slots {
  @get
  op list(
    @path eventTypeId: int64,
    @query date?: plainDate
  ): Slot[] | NotFound | BadRequest;
}
