// ─────────────────────────────────────────────────────────────
// api/client.ts
// Base fetch wrapper — used by ALL api/*.api.ts files
// ─────────────────────────────────────────────────────────────

import { AUTH_EXPIRED_EVENT } from "@/lib/auth/AuthContext";
import { useAuthStore } from "@/store/auth.store";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

// ── Typed API error ────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Core fetch wrapper ─────────────────────────────────────────

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = useAuthStore.getState().token?.accessToken;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // 401 — session expired: broadcast event so AuthProvider can handle
  if (res.status === 401) {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    throw new ApiError(401, "UNAUTHORIZED", "Session expired");
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body.code ?? "UNKNOWN_ERROR",
      body.message ?? `Request failed with status ${res.status}`,
      body.fieldErrors,
    );
  }

  return body as T;
}

// ── Convenience methods ────────────────────────────────────────

export const apiGet  = <T>(path: string) =>
  apiFetch<T>(path, { method: "GET" });

export const apiPost = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });

export const apiPut  = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) });

export const apiDelete = <T>(path: string) =>
  apiFetch<T>(path, { method: "DELETE" });

export const apiPatch = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });
