import type { components } from "../../generated/api-types";
import {
  apiClient,
  authorized,
  unwrapApiResponse,
} from "../../services/api";
import type { AppointmentStatus } from "./appointments.types";

type CreateAppointmentPayload = components["schemas"]["CreateAppointmentDto"];
type RecurringPayload = components["schemas"]["CreateRecurringBookingDto"];

export async function getAppointments(token: string) {
  return unwrapApiResponse(
    await apiClient.GET("/api/appointments", {
      headers: authorized(token),
    }),
  );
}

export async function getMyAppointments(token: string) {
  return unwrapApiResponse(
    await apiClient.GET("/api/appointments/me", {
      headers: authorized(token),
    }),
  );
}

export async function getAvailability(
  token: string,
  date: string,
  serviceId: string,
) {
  return unwrapApiResponse(
    await apiClient.GET("/api/appointments/availability", {
      headers: authorized(token),
      params: { query: { date, serviceId } },
    }),
  );
}

export async function createAppointment(
  token: string,
  payload: CreateAppointmentPayload,
) {
  return unwrapApiResponse(
    await apiClient.POST("/api/appointments", {
      headers: authorized(token),
      body: payload,
    }),
  );
}

export async function rescheduleAppointment(
  token: string,
  id: string,
  payload: components["schemas"]["RescheduleAppointmentDto"],
) {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/appointments/{id}/reschedule", {
      headers: authorized(token),
      params: { path: { id } },
      body: payload,
    }),
  );
}

export async function deleteAppointment(token: string, id: string) {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/appointments/{id}", {
      headers: authorized(token),
      params: { path: { id } },
    }),
  );
}

export async function updateAppointmentStatus(
  token: string,
  id: string,
  status: AppointmentStatus,
) {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/appointments/{id}/status", {
      headers: authorized(token),
      params: { path: { id } },
      body: { status },
    }),
  );
}

export async function getRecurringBookings(token: string) {
  return unwrapApiResponse(
    await apiClient.GET("/api/appointments/recurring", {
      headers: authorized(token),
    }),
  );
}

export async function createRecurringBooking(
  token: string,
  payload: RecurringPayload,
) {
  return unwrapApiResponse(
    await apiClient.POST("/api/appointments/recurring", {
      headers: authorized(token),
      body: payload,
    }),
  );
}

export async function updateRecurringBooking(
  token: string,
  id: string,
  payload: RecurringPayload,
) {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/appointments/recurring/{id}", {
      headers: authorized(token),
      params: { path: { id } },
      body: payload,
    }),
  );
}

export async function deleteRecurringBooking(token: string, id: string) {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/appointments/recurring/{id}", {
      headers: authorized(token),
      params: { path: { id } },
    }),
  );
}
