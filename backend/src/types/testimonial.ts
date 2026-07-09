import { z } from "zod";
import type { BaseEntity } from "./common";

export const testimonialCreateSchema = z.object({
  quote: z.string().min(1),
  name: z.string().min(1),
  role: z.string(),
  project: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  avatar: z.string().url().optional(),
  featured: z.boolean().default(false),
  propertyId: z.string().nullable().optional(),
});

export const testimonialUpdateSchema = testimonialCreateSchema.partial();

export type TestimonialCreateInput = z.infer<typeof testimonialCreateSchema>;
export type TestimonialUpdateInput = z.infer<typeof testimonialUpdateSchema>;
export type Testimonial = TestimonialCreateInput & BaseEntity;
