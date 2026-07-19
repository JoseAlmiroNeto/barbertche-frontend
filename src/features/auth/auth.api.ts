import {
  apiClient,
  authorized,
  unwrapApiResponse,
} from "../../services/api";
import type { LoginPayload, RegisterPayload } from "./auth.types";

export async function login(payload: LoginPayload) {
  return unwrapApiResponse(
    await apiClient.POST("/api/auth/login", { body: payload }),
  );
}

export async function register(payload: RegisterPayload) {
  return unwrapApiResponse(
    await apiClient.POST("/api/auth/register", { body: payload }),
  );
}

export async function getAuthenticatedUser(token: string) {
  return unwrapApiResponse(
    await apiClient.GET("/api/auth/me", { headers: authorized(token) }),
  );
}

export async function logout(token: string) {
  return unwrapApiResponse(
    await apiClient.POST("/api/auth/logout", { headers: authorized(token) }),
  );
}

export async function savePushToken(
  token: string,
  pushToken: string,
  platform: "android" | "ios",
) {
  return unwrapApiResponse(
    await apiClient.POST("/api/auth/push-token", {
      headers: authorized(token),
      body: { token: pushToken, platform },
    }),
  );
}

export async function removePushToken(token: string, pushToken: string) {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/auth/push-token", {
      headers: authorized(token),
      body: { token: pushToken },
    }),
  );
}
