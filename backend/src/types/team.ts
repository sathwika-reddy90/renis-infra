import { z } from "zod";
import type { BaseEntity } from "./common";

export const teamCreateSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  image: z.string().url(),
  bio: z.string().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  email: z.string().email().optional(),
  order: z.number().int().nonnegative().default(0),
});

export const teamUpdateSchema = teamCreateSchema.partial();

export type TeamCreateInput = z.infer<typeof teamCreateSchema>;
export type TeamUpdateInput = z.infer<typeof teamUpdateSchema>;
export type TeamMember = TeamCreateInput & BaseEntity;
