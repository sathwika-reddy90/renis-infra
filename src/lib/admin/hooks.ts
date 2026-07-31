"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/Toast";
import { usersApi, inquiryHistoryApi, type CrudApi } from "./api";

export const adminKeys = {
  list: (resource: string) => ["admin", resource] as const,
  site: ["admin", "site"] as const,
  content: ["admin", "content"] as const,
  users: ["admin", "users"] as const,
  inquiryHistory: (id: string) => ["admin", "inquiries", id, "history"] as const,
};

/** Directory list for the lead "Assign to" picker. */
export function useUsersList() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: ({ signal }) => usersApi.list(signal),
  });
}

/** Status-change timeline for a single lead; only fetched while its detail view is open. */
export function useInquiryHistory(id: string | null) {
  return useQuery({
    queryKey: adminKeys.inquiryHistory(id ?? ""),
    queryFn: ({ signal }) => inquiryHistoryApi.get(id as string, signal),
    enabled: id !== null,
  });
}

function errMsg(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Something went wrong";
}

export function useAdminList<T, I>(resource: string, api: CrudApi<T, I>) {
  return useQuery({
    queryKey: adminKeys.list(resource),
    queryFn: ({ signal }) => api.list(signal),
  });
}

/**
 * Shared create/update/delete mutations with optimistic cache updates
 * (update & delete), rollback on failure, and success/error toasts.
 */
export function useCrudMutations<T extends { id: string }, I>(
  resource: string,
  api: CrudApi<T, I>,
  label: string,
) {
  const qc = useQueryClient();
  const { push } = useToast();
  const key = adminKeys.list(resource);
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: (data: I) => api.create(data),
    onSuccess: () => push("success", `${label} created`),
    onError: (error) => push("error", errMsg(error)),
    onSettled: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; data: Partial<I> }) => api.update(vars.id, vars.data),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<T[]>(key);
      qc.setQueryData<T[]>(key, (old) =>
        old?.map((row) => (row.id === vars.id ? { ...row, ...(vars.data as Partial<T>) } : row)),
      );
      return { prev };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      push("error", errMsg(error));
    },
    onSuccess: () => push("success", `${label} updated`),
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<T[]>(key);
      qc.setQueryData<T[]>(key, (old) => old?.filter((row) => row.id !== id));
      return { prev };
    },
    onError: (error, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      push("error", errMsg(error));
    },
    onSuccess: () => push("success", `${label} deleted`),
    onSettled: invalidate,
  });

  return { create, update, remove };
}
