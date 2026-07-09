import { authClient, getAccessToken, refreshAccessToken } from "@/lib/admin/authClient";
import { ApiError } from "@/lib/api/client";
import type { AdminMedia } from "./types";

export interface MediaListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface MediaListResult {
  items: AdminMedia[];
  total: number;
  page: number;
  limit: number;
}

interface Envelope<T> {
  success: boolean;
  data: T;
  meta?: { total?: number; page?: number; limit?: number };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function queryString(params: MediaListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.search) search.set("search", params.search);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/** Media has its own list shape (paginated, with meta) — not the plain-array CrudApi. */
export const mediaApi = {
  list: async (params: MediaListParams = {}, signal?: AbortSignal): Promise<MediaListResult> => {
    const path = `/media${queryString(params)}`;
    const raw = await fetchEnvelope<AdminMedia[]>(path, signal);
    return {
      items: raw.data,
      total: raw.meta?.total ?? raw.data.length,
      page: raw.meta?.page ?? 1,
      limit: raw.meta?.limit ?? raw.data.length,
    };
  },

  upload: (files: File[]): Promise<AdminMedia[]> => {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    return authClient.postForm<AdminMedia[]>("/media/upload", form);
  },

  rename: (id: string, fileName: string): Promise<AdminMedia> =>
    authClient.patch<AdminMedia>(`/media/${id}/rename`, { fileName }),

  replace: (id: string, file: File): Promise<AdminMedia> => {
    const form = new FormData();
    form.append("file", file);
    return authClient.putForm<AdminMedia>(`/media/${id}/replace`, form);
  },

  remove: (id: string): Promise<void> => authClient.delete<void>(`/media/${id}`),
};

// The list endpoint returns pagination meta the generic authClient helpers
// discard; fetch it directly here so callers get total/page/limit back.
async function fetchEnvelope<T>(path: string, signal?: AbortSignal): Promise<Envelope<T>> {
  const doFetch = () =>
    fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      signal,
      headers: getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : undefined,
    });

  let res = await doFetch();
  if (res.status === 401) {
    const token = await refreshAccessToken();
    if (token) res = await doFetch();
  }
  const payload = (await res.json()) as Envelope<T>;
  if (!res.ok || !payload.success) {
    throw new ApiError("Failed to load media", res.status);
  }
  return payload;
}
