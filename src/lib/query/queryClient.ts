import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/client";

/*
 * Transient failures worth retrying automatically: network/CORS failures
 * (status 0 — the request never got a response), 5xx from a backend that is
 * cold-starting or briefly overloaded, plus 408/429. Genuine 4xx responses
 * (not found, validation, auth) are final — retrying them only adds load.
 */
function isTransient(error: unknown): boolean {
  if (error instanceof ApiError) {
    return (
      error.status === 0 ||
      error.status >= 500 ||
      error.status === 408 ||
      error.status === 429
    );
  }
  // A non-ApiError here means fetch itself threw — network-level, retryable.
  return true;
}

// Shared defaults: retry transient failures, cache for a minute, no focus refetch.
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Up to 4 attempts with 1.5s → 3s → 6s backoff (~10.5s window), long
        // enough to ride out a Railway cold start without hammering it. If
        // the API is genuinely down past that, the section's error UI (with
        // its manual RETRY) still appears.
        retry: (failureCount, error) => failureCount < 3 && isTransient(error),
        retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 8000),
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
