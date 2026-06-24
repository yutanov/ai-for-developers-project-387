import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";

import "./models.tsp";
import "./event-types.tsp";
import "./bookings.tsp";
import "./slots.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

@service(#{
  title: "Calendar Booking API",
})
@info(#{
  version: "1.0.0",
})
@server("http://localhost:3000", "Local development")
namespace CalendarBooking;
