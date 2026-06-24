using TypeSpec.Http;
using TypeSpec.Rest;

@route("/api/admin/bookings")
namespace CalendarBooking.AdminBookings {
  @get
  op list(...Pagination): PageResponse<Booking> | BadRequest;
}

@route("/api/bookings")
namespace CalendarBooking.GuestBookings {
  @post
  op create(@body createBookingRequest: CreateBookingRequest): {
    @statusCode _: 201;
    @body booking: Booking;
  } | BadRequest | NotFound | Conflict | UnprocessableEntity;
}
