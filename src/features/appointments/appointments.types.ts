import type { components } from "../../generated/api-types";

export type Appointment = components["schemas"]["AppointmentResponseDto"];
export type AppointmentStatus = Appointment["status"];
export type RecurringBooking =
  components["schemas"]["RecurringBookingResponseDto"];
export type Interval = { start: string; end: string };
