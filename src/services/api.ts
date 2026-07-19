import createClient from "openapi-fetch";
import {
  clearStoredAuthSession,
  getStoredAuthToken,
  getStoredRefreshToken,
  storeAuthSession,
} from "../features/auth/auth.storage";
import type { AuthResponse } from "../features/auth/auth.types";
import type { paths } from "../generated/api-types";

const fallbackApiBaseUrl = "http://10.0.2.2:3333/api";

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ?? fallbackApiBaseUrl
).replace(/\/+$/, "");

const apiOrigin = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL;

let refreshSessionPromise: Promise<AuthResponse> | null = null;
let sessionExpiredHandler: (() => void) | null = null;

export const apiClient = createClient<paths>({
  baseUrl: apiOrigin,
  fetch: fetchWithSession,
});

export function setSessionExpiredHandler(handler: (() => void) | null) {
  sessionExpiredHandler = handler;
}

export function authorized(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function unwrapApiResponse<T>({
  data,
  error,
}: {
  data?: T;
  error?: unknown;
  response: Response;
}): T {
  if (error !== undefined) {
    throw new Error(formatApiError(error));
  }
  return data as T;
}

async function fetchWithSession(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const request = input instanceof Request ? input : new Request(input, init);
  const hasAuthorization = request.headers.has("Authorization");
  const requestToSend = hasAuthorization
    ? await withCurrentAccessToken(request)
    : request;
  const retrySource = requestToSend.clone();

  let response: Response;
  try {
    response = await fetch(requestToSend);
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
    );
  }

  if (response.status !== 401 || !hasAuthorization) {
    return response;
  }

  const session = await refreshStoredAuthSession();
  const retryHeaders = new Headers(retrySource.headers);
  retryHeaders.set("Authorization", `Bearer ${session.accessToken}`);
  return fetch(new Request(retrySource, { headers: retryHeaders }));
}

async function withCurrentAccessToken(request: Request) {
  const storedToken = await getStoredAuthToken();
  if (!storedToken) {
    return request;
  }

  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${storedToken}`);
  return new Request(request, { headers });
}

function refreshStoredAuthSession(): Promise<AuthResponse> {
  if (refreshSessionPromise) {
    return refreshSessionPromise;
  }

  refreshSessionPromise = performSessionRefresh().finally(() => {
    refreshSessionPromise = null;
  });
  return refreshSessionPromise;
}

async function performSessionRefresh() {
  const refreshToken = await getStoredRefreshToken();
  if (!refreshToken) {
    await expireStoredSession();
    throw new Error("Sessão expirada. Entre novamente.");
  }

  try {
    const session = unwrapApiResponse(
      await apiClient.POST("/api/auth/refresh", {
        body: { refreshToken },
      }),
    );
    await storeAuthSession(session.accessToken, session.refreshToken);
    return session;
  } catch (error) {
    await expireStoredSession();
    throw error;
  }
}

async function expireStoredSession() {
  await clearStoredAuthSession();
  sessionExpiredHandler?.();
}

function formatApiError(body: unknown) {
  if (typeof body === "object" && body && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message)) {
      return message.join("\n");
    }
    if (typeof message === "string") {
      return message;
    }
  }

  return "Não foi possível concluir a operação.";
}
