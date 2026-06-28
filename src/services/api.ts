export const API_BASE_URL = "http://10.0.2.2:3333/api";

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

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, headers, ...requestOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message ?? "Nao foi possivel concluir a operacao.");
  }

  return body as T;
}
