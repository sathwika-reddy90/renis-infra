// Reusable, typed HTTP client for the RENISINFRA backend.
// The backend wraps every response in { success, data, message?, details? };
// this client unwraps `data` and surfaces failures as ApiError.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

interface Envelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  details?: unknown;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    throw new ApiError(
      "Unable to reach the server. Please check your connection and try again.",
      0,
      cause,
    );
  }

  // 204 No Content (e.g. DELETE) — nothing to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = (isJson ? await response.json() : null) as Envelope<T> | null;

  if (!response.ok || !payload?.success) {
    const message = payload?.message ?? response.statusText ?? "Request failed";
    throw new ApiError(message, response.status, payload?.details);
  }

  return payload.data as T;
}

export const apiClient = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: "GET", signal }),
  post: <T>(path: string, body: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: "POST", body, signal }),
  put: <T>(path: string, body: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: "PUT", body, signal }),
  patch: <T>(path: string, body: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: "PATCH", body, signal }),
  delete: <T>(path: string, signal?: AbortSignal) =>
    request<T>(path, { method: "DELETE", signal }),
};
