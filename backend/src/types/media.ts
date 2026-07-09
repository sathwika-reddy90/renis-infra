import { z } from "zod";
import type { BaseEntity } from "./common";

export const MEDIA_TYPES = ["IMAGE", "VIDEO", "DOCUMENT"] as const;
export type MediaTypeValue = (typeof MEDIA_TYPES)[number];

export interface Media extends BaseEntity {
  provider: string;
  url: string;
  thumbnailUrl: string | null;
  fileName: string;
  mimeType: string;
  type: MediaTypeValue;
  size: number;
  width: number | null;
  height: number | null;
}

export const mediaRenameSchema = z.object({
  fileName: z.string().min(1, "File name is required").max(255),
});
export type MediaRenameInput = z.infer<typeof mediaRenameSchema>;

export const mediaListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(24),
  search: z.string().trim().optional(),
  type: z.enum(MEDIA_TYPES).optional(),
});
export type MediaListQuery = z.infer<typeof mediaListQuerySchema>;

export interface MediaListResult {
  items: Media[];
  total: number;
  page: number;
  limit: number;
}
