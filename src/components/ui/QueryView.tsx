"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import ErrorState from "./ErrorState";

type MinimalQuery<T> = Pick<UseQueryResult<T>, "data" | "isPending" | "isError" | "refetch">;

/**
 * Centralizes loading / error / retry handling for any query so pages don't
 * duplicate the pattern. Renders `skeleton` while pending and an ErrorState
 * (with retry) on failure, otherwise passes the resolved data to `children`.
 */
export default function QueryView<T>({
  query,
  skeleton,
  errorMessage,
  invertError = false,
  children,
}: {
  query: MinimalQuery<T>;
  skeleton: React.ReactNode;
  errorMessage?: string;
  invertError?: boolean;
  children: (data: T) => React.ReactNode;
}) {
  if (query.isPending) return <>{skeleton}</>;
  if (query.isError) {
    return (
      <ErrorState message={errorMessage} onRetry={() => void query.refetch()} invert={invertError} />
    );
  }
  // `data` is resolved once not pending/error; guard keeps the type non-optional.
  if (query.data === undefined) return <>{skeleton}</>;
  return <>{children(query.data)}</>;
}
