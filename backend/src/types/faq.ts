import { z } from "zod";
import type { BaseEntity } from "./common";

export const faqCreateSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().min(1),
  order: z.number().int().nonnegative().default(0),
  propertyId: z.string().nullable().optional(),
});

export const faqUpdateSchema = faqCreateSchema.partial();

export type FaqCreateInput = z.infer<typeof faqCreateSchema>;
export type FaqUpdateInput = z.infer<typeof faqUpdateSchema>;
export type FAQ = FaqCreateInput & BaseEntity;
