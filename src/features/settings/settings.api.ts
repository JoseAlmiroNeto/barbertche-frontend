import type { components } from "../../generated/api-types";
import {
  apiClient,
  authorized,
  unwrapApiResponse,
} from "../../services/api";
import type { BusinessHours } from "./settings.types";

type ClosedDateResponse = components["schemas"]["ClosedDateResponseDto"];

export async function getSettings(token: string) {
  return unwrapApiResponse(
    await apiClient.GET("/api/settings", { headers: authorized(token) }),
  );
}

export async function createManualBlock(
  token: string,
  payload: components["schemas"]["CreateBlockDto"],
) {
  return unwrapApiResponse(
    await apiClient.POST("/api/settings/blocks", {
      headers: authorized(token),
      body: payload,
    }),
  );
}

export async function deleteManualBlock(token: string, id: string) {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/settings/blocks/{id}", {
      headers: authorized(token),
      params: { path: { id } },
    }),
  );
}

export async function updateBusinessHour(
  token: string,
  weekday: number,
  hours: BusinessHours[number],
) {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/settings/business-hours", {
      headers: authorized(token),
      body: hours
        ? { weekday, open: hours.open, close: hours.close }
        : { weekday },
    }),
  );
}

export async function createClosedDate(token: string, date: string) {
  const items = unwrapApiResponse(
    await apiClient.POST("/api/settings/closed-dates", {
      headers: authorized(token),
      body: { date, reason: "Fechado pelo estabelecimento." },
    }),
  ) as ClosedDateResponse[];
  return items.map((item) => item.date);
}

export async function deleteClosedDate(token: string, date: string) {
  const items = unwrapApiResponse(
    await apiClient.DELETE("/api/settings/closed-dates/{date}", {
      headers: authorized(token),
      params: { path: { date } },
    }),
  ) as ClosedDateResponse[];
  return items.map((item) => item.date);
}
