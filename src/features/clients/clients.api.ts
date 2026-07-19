import {
  apiClient,
  authorized,
  unwrapApiResponse,
} from "../../services/api";
import type { components } from "../../generated/api-types";

export async function getClients(token: string) {
  return unwrapApiResponse(
    await apiClient.GET("/api/clients", { headers: authorized(token) }),
  );
}

export async function createClient(
  token: string,
  name: string,
  phone: string,
) {
  return unwrapApiResponse(
    await apiClient.POST("/api/clients", {
      headers: authorized(token),
      body: { name, phone },
    }),
  );
}

export async function updateClient(
  token: string,
  id: string,
  payload: components["schemas"]["UpdateClientDto"],
) {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/clients/{id}", {
      headers: authorized(token),
      params: { path: { id } },
      body: payload,
    }),
  );
}

export async function deleteClient(token: string, id: string) {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/clients/{id}", {
      headers: authorized(token),
      params: { path: { id } },
    }),
  );
}
