import { ApiError } from "@/lib/api/client";

// Authenticated client for the admin CMS: attaches the Bearer access token,
// sends the refresh cookie, and transparently refreshes + retries once on 401.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

let accessToken: string | null = null;
let sessionEndedHandler: (() => void) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;
export const onSessionEnded = (handler: () => void) => {
  sessionEndedHandler = handler;
};

interface Envelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  details?: unknown;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function authHeaders(hasJsonBody: boolean): HeadersInit {
  const headers: Record<string, string> = {};
  if (hasJsonBody) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
}

async function raw(method: Method, path: string, body?: unknown, signal?: AbortSignal) {
  const isFormData = body instanceof FormData;
  return fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    credentials: "include",
    // FormData sets its own multipart Content-Type (with boundary) — never override it.
    headers: authHeaders(body !== undefined && !isFormData),
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// Single-flight refresh so concurrent 401s trigger only one refresh call.
let refreshing: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) return null;
        const payload = (await res.json()) as Envelope<{ accessToken: string }>;
        const token = payload.data?.accessToken ?? null;
        accessToken = token;
        return token;
      } catch {
        return null;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

async function unwrap<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = (isJson ? await res.json() : null) as Envelope<T> | null;
  if (!res.ok || !payload?.success) {
    throw new ApiError(payload?.message ?? res.statusText ?? "Request failed", res.status, payload?.details);
  }
  return payload.data as T;
}

async function request<T>(
  method: Method,
  path: string,
  body?: unknown | FormData,
  signal?: AbortSignal,
): Promise<T> {
  let res: Response;
  try {
    res = await raw(method, path, body, signal);
  } catch (cause) {
    throw new ApiError("Unable to reach the server.", 0, cause);
  }

  // Transparently refresh + retry once for CRUD (not the auth endpoints).
  if (res.status === 401 && !path.startsWith("/auth/")) {
    const token = await refreshAccessToken();
    if (token) {
      res = await raw(method, path, body, signal);
    } else {
      sessionEndedHandler?.();
      throw new ApiError("Your session has expired. Please sign in again.", 401);
    }
  }

  return unwrap<T>(res);
}

export const authClient = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>("GET", path, undefined, signal),
  post: <T>(path: string, body: unknown, signal?: AbortSignal) => request<T>("POST", path, body, signal),
  put: <T>(path: string, body: unknown, signal?: AbortSignal) => request<T>("PUT", path, body, signal),
  patch: <T>(path: string, body: unknown, signal?: AbortSignal) => request<T>("PATCH", path, body, signal),
  delete: <T>(path: string, signal?: AbortSignal) => request<T>("DELETE", path, undefined, signal),
  /** Multipart uploads (file input is a FormData body, not JSON). */
  postForm: <T>(path: string, form: FormData, signal?: AbortSignal) => request<T>("POST", path, form, signal),
  putForm: <T>(path: string, form: FormData, signal?: AbortSignal) => request<T>("PUT", path, form, signal),
};
