import type { components } from "../../generated/api-types";
import {
  apiClient,
  authorized,
  unwrapApiResponse,
} from "../../services/api";

type CreateServicePayload = components["schemas"]["CreateServiceDto"];
type UpdateServicePayload = components["schemas"]["UpdateServiceDto"];

export async function getServices(token: string) {
  return unwrapApiResponse(
    await apiClient.GET("/api/services", { headers: authorized(token) }),
  );
}

export async function createService(
  token: string,
  payload: CreateServicePayload,
) {
  return unwrapApiResponse(
    await apiClient.POST("/api/services", {
      headers: authorized(token),
      body: payload,
    }),
  );
}

export async function updateService(
  token: string,
  id: string,
  payload: UpdateServicePayload,
) {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/services/{id}", {
      headers: authorized(token),
      params: { path: { id } },
      body: payload,
    }),
  );
}

export async function deleteService(token: string, id: string) {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/services/{id}", {
      headers: authorized(token),
      params: { path: { id } },
    }),
  );
}
