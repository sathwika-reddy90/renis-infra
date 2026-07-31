import { z } from "zod";
import type { BaseEntity } from "./common";
import { PropertyTypeSchema, PropertyStatusSchema } from "./enums";

/**
 * An image reference: either an absolute URL (external/stock imagery) or a
 * root-relative path such as "/uploads/2026/07/x.jpg".
 *
 * Relative paths matter for portability — storing the absolute media origin
 * would bake the current host into every row and break on deploy.
 */
export const mediaUrl = () =>
  z
    .string()
    .min(1)
    .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), {
      message: "Must be an absolute URL or a path starting with /",
    });

/* Nested structured shapes stored as JSON on the Property record. */

export const floorPlanSchema = z.object({
  id: z.string(),
  type: z.string(),
  area: z.string(),
  image: mediaUrl(),
  details: z.array(z.string()),
  price: z.string().optional(),
});

export const specificationSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

export const paymentPlanSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  milestone: z.string().optional(),
});

export const nearbyLandmarkSchema = z.object({
  place: z.string(),
  distance: z.string(),
  category: z.string().optional(),
});

export const propertyStatSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const highlightSchema = z.object({
  title: z.string(),
  description: z.string(),
  /** Key into the frontend's lucide icon registry. */
  icon: z.string().optional(),
});

export const seoSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  keywords: z.array(z.string()),
  ogImage: z.string().optional(),
});

export const propertyCreateSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string(),
  description: z.string(),
  location: z.string(),
  city: z.string(),
  state: z.string(),
  price: z.number().int().nonnegative(),
  priceLabel: z.string(),
  propertyType: PropertyTypeSchema,
  status: PropertyStatusSchema.default("NEW_LAUNCH"),
  bedrooms: z.string(),
  bathrooms: z.number().int().nonnegative(),
  area: z.string(),
  possession: z.string(),
  reraNumber: z.string(),
  developer: z.string(),
  developerLogo: mediaUrl().optional(),
  featuredImage: mediaUrl(),
  heroImages: z.array(mediaUrl()).default([]),
  video: z.string().url().optional(),
  virtualTour: z.string().url().optional(),
  brochure: z.string().optional(),
  masterPlan: mediaUrl(),
  masterLegend: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  gallery: z.array(mediaUrl()).default([]),
  amenities: z.array(z.string()).default([]),
  floorPlans: z.array(floorPlanSchema).default([]),
  specifications: z.array(specificationSchema).default([]),
  paymentPlans: z.array(paymentPlanSchema).default([]),
  nearbyLandmarks: z.array(nearbyLandmarkSchema).default([]),
  overviewStats: z.array(propertyStatSchema).default([]),
  highlights: z.array(highlightSchema).default([]),
  lat: z.number().optional(),
  lng: z.number().optional(),
  seo: seoSchema,
});

export const propertyUpdateSchema = propertyCreateSchema.partial();

/**
 * Public listing query. Validated as `query`, so every value arrives as a
 * string and needs coercion.
 */
export const propertyListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(60).default(12),
  status: PropertyStatusSchema.optional(),
  propertyType: PropertyTypeSchema.optional(),
  city: z.string().trim().min(1).optional(),
  location: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  featured: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sort: z.enum(["curated", "newest", "priceAsc", "priceDesc"]).default("curated"),
});
export type PropertyListQuery = z.infer<typeof propertyListQuerySchema>;

export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;
export type Property = PropertyCreateInput & BaseEntity;
