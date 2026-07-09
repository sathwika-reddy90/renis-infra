import { z } from "zod";
import type { BaseEntity } from "./common";
import { GalleryCategorySchema } from "./enums";

export const galleryCreateSchema = z.object({
  src: z.string().url(),
  alt: z.string(),
  category: GalleryCategorySchema,
  order: z.number().int().nonnegative().default(0),
  propertyId: z.string().nullable().optional(),
});

export const galleryUpdateSchema = galleryCreateSchema.partial();

export type GalleryCreateInput = z.infer<typeof galleryCreateSchema>;
export type GalleryUpdateInput = z.infer<typeof galleryUpdateSchema>;
export type GalleryImage = GalleryCreateInput & BaseEntity;
