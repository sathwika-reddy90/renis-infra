import { z } from "zod";
import type { BaseEntity } from "./common";

// Model reserved for future analytics; no route is exposed yet.
export const visitorCreateSchema = z.object({
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  path: z.string(),
  referrer: z.string().optional(),
});

export type VisitorCreateInput = z.infer<typeof visitorCreateSchema>;
export type Visitor = VisitorCreateInput & Pick<BaseEntity, "id" | "createdAt">;
