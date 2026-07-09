import { z } from "zod";

export const PropertyTypeSchema = z.enum(["APARTMENTS", "VILLAS", "PENTHOUSES", "PLOTS"]);
export type PropertyType = z.infer<typeof PropertyTypeSchema>;

export const PropertyStatusSchema = z.enum([
  "NEW_LAUNCH",
  "NOW_SELLING",
  "READY_TO_MOVE",
  "COMING_SOON",
  "SOLD_OUT",
]);
export type PropertyStatus = z.infer<typeof PropertyStatusSchema>;

export const GalleryCategorySchema = z.enum(["INTERIORS", "EXTERIORS", "AMENITIES", "LIFESTYLE"]);
export type GalleryCategory = z.infer<typeof GalleryCategorySchema>;

export const BlogStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type BlogStatus = z.infer<typeof BlogStatusSchema>;

export const InquiryStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "VISIT_SCHEDULED",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
]);
export type InquiryStatus = z.infer<typeof InquiryStatusSchema>;
