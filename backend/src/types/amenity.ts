import { z } from "zod";
import type { BaseEntity } from "./common";

export const amenityCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  icon: z.string().min(1),
  category: z.string().optional(),
});

export const amenityUpdateSchema = amenityCreateSchema.partial();

export type AmenityCreateInput = z.infer<typeof amenityCreateSchema>;
export type AmenityUpdateInput = z.infer<typeof amenityUpdateSchema>;
export type Amenity = AmenityCreateInput & BaseEntity;
