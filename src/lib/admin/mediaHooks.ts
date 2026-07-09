"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/Toast";
import { mediaApi, type MediaListParams } from "./mediaApi";

const mediaKey = (params: MediaListParams) =>
  ["admin", "media", params.page ?? 1, params.limit ?? 24, params.search ?? ""] as const;

function errMsg(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Something went wrong";
}

export function useMediaLibrary(params: MediaListParams) {
  return useQuery({
    queryKey: mediaKey(params),
    queryFn: ({ signal }) => mediaApi.list(params, signal),
    placeholderData: (prev) => prev,
  });
}

/** Upload/rename/replace/delete mutations, invalidating every cached media page on settle. */
export function useMediaMutations() {
  const qc = useQueryClient();
  const { push } = useToast();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "media"] });

  const upload = useMutation({
    mutationFn: (files: File[]) => mediaApi.upload(files),
    onSuccess: (created) => push("success", `Uploaded ${created.length} file${created.length === 1 ? "" : "s"}`),
    onError: (error) => push("error", errMsg(error)),
    onSettled: invalidate,
  });

  const rename = useMutation({
    mutationFn: (vars: { id: string; fileName: string }) => mediaApi.rename(vars.id, vars.fileName),
    onSuccess: () => push("success", "Renamed"),
    onError: (error) => push("error", errMsg(error)),
    onSettled: invalidate,
  });

  const replace = useMutation({
    mutationFn: (vars: { id: string; file: File }) => mediaApi.replace(vars.id, vars.file),
    onSuccess: () => push("success", "File replaced"),
    onError: (error) => push("error", errMsg(error)),
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => mediaApi.remove(id),
    onSuccess: () => push("success", "Deleted"),
    onError: (error) => push("error", errMsg(error)),
    onSettled: invalidate,
  });

  return { upload, rename, replace, remove };
}
