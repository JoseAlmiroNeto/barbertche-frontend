import {
  clearStoredAuthToken,
  getStoredRefreshToken,
  storeAuthTokens,
} from "./authStorage";

const fallbackApiBaseUrl = "http://10.0.2.2:3333/api";
const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const defaultTimeoutMs = 15_000;

if (process.env.NODE_ENV === "production" && !configuredApiBaseUrl) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL deve ser configurada em produção.");
}

export const API_BASE_URL = (configuredApiBaseUrl ?? fallbackApiBaseUrl).replace(
  /\/$/,
  "",
);

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "CLIENT";
  client: { id: string; name: string; phone: string } | null;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type ApiErrorKind =
  | "http"
  | "network"
  | "timeout"
  | "unauthorized"
  | "invalid-response";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly kind: ApiErrorKind,
    readonly status: number | null,
    readonly requestId: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiRequestOptions = RequestInit & {
  token?: string;
  timeoutMs?: number;
};

let unauthorizedHandler: (() => void) | null = null;
let tokenRefreshedHandler: ((accessToken: string) => void) | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function setTokenRefreshedHandler(handler: ((accessToken: string) => void) | null) {
  tokenRefreshedHandler = handler;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return executeRequest<T>(path, options, true);
}

async function executeRequest<T>(
  path: string,
  options: ApiRequestOptions,
  allowRefresh: boolean,
): Promise<T> {
  const {
    token,
    timeoutMs = defaultTimeoutMs,
    headers,
    signal,
    ...requestOptions
  } = options;
  const controller = new AbortController();
  const requestId = createRequestId();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener("abort", abortFromCaller, { once: true });
  if (signal?.aborted) {
    controller.abort();
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      signal: controller.signal,
      headers: {
        ...(requestOptions.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        Accept: "application/json",
        "X-Request-Id": requestId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
    const responseRequestId = response.headers.get("x-request-id") ?? requestId;
    const body = await parseResponseBody(response, responseRequestId);

    if (!response.ok) {
      const unauthorized = response.status === 401 && Boolean(token);
      if (unauthorized && allowRefresh && path !== "/auth/refresh") {
        const nextToken = await refreshAccessToken();
        if (nextToken) {
          return executeRequest<T>(path, { ...options, token: nextToken }, false);
        }
      }
      if (unauthorized) unauthorizedHandler?.();
      throw new ApiError(
        formatApiError(body),
        unauthorized ? "unauthorized" : "http",
        response.status,
        responseRequestId,
        body,
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (controller.signal.aborted) {
      const timedOut = !signal?.aborted;
      throw new ApiError(
        timedOut
          ? "O servidor demorou para responder. Tente novamente."
          : "A operação foi cancelada.",
        timedOut ? "timeout" : "network",
        null,
        requestId,
      );
    }
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
      "network",
      null,
      requestId,
      error,
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getStoredRefreshToken();
      if (!refreshToken) return null;
      try {
        const response = await executeRequest<AuthResponse>(
          "/auth/refresh",
          { method: "POST", body: JSON.stringify({ refreshToken }) },
          false,
        );
        await storeAuthTokens(response.accessToken, response.refreshToken);
        tokenRefreshedHandler?.(response.accessToken);
        return response.accessToken;
      } catch {
        await clearStoredAuthToken();
        return null;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function refreshSession() {
  const accessToken = await refreshAccessToken();
  if (!accessToken) throw new Error("Sessao expirada. Entre novamente.");
  return accessToken;
}

async function parseResponseBody(response: Response, requestId: string) {
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(
      "O servidor retornou uma resposta inválida.",
      "invalid-response",
      response.status,
      requestId,
    );
  }
}

function formatApiError(body: unknown) {
  if (typeof body === "object" && body && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message)) return message.join("\n");
    if (typeof message === "string") return message;
  }
  return "Não foi possível concluir a operação.";
}

function createRequestId() {
  return `mobile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
