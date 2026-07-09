import { ApiError } from "@/lib/api/client";
import { authClient, setAccessToken, refreshAccessToken } from "./authClient";
import type { AuthUser } from "./permissions";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface SessionPayload {
  user: AuthUser;
  accessToken: string;
}
interface Envelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  details?: unknown;
}

async function postAuth(path: string, body?: unknown): Promise<SessionPayload> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = (await res.json().catch(() => null)) as Envelope<SessionPayload> | null;
  if (!res.ok || !payload?.success || !payload.data) {
    throw new ApiError(payload?.message ?? "Request failed", res.status, payload?.details);
  }
  setAccessToken(payload.data.accessToken);
  return payload.data;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { user } = await postAuth("/auth/login", { email, password });
  return user;
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
  } finally {
    setAccessToken(null);
  }
}

/** Restores a session from the refresh cookie on app load. */
export async function bootstrapSession(): Promise<AuthUser | null> {
  const token = await refreshAccessToken();
  if (!token) return null;
  try {
    const { user } = await authClient.get<{ user: AuthUser }>("/auth/me");
    return user;
  } catch {
    return null;
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<AuthUser> {
  const payload = await authClient.put<SessionPayload>("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  setAccessToken(payload.accessToken);
  return payload.user;
}
