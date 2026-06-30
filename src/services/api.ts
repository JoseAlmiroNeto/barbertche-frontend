const fallbackApiBaseUrl = "http://10.0.2.2:3333/api";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? fallbackApiBaseUrl;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "CLIENT";
  client: {
    id: string;
    name: string;
    phone: string;
  } | null;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

type ApiRequestOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, headers, ...requestOptions } = options;
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
    );
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(formatApiError(body));
  }

  return body as T;
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
