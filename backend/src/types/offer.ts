import { z } from "zod";
import type { BaseEntity } from "./common";

export const offerCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  discount: z.string().min(1),
  image: z.string().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  ctaText: z.string().nullable().optional(),
  ctaLink: z.string().nullable().optional(),
  priority: z.number().int().nonnegative().default(0),
  enabled: z.boolean().default(true),
});

export const offerUpdateSchema = offerCreateSchema.partial();

export type OfferCreateInput = z.infer<typeof offerCreateSchema>;
export type OfferUpdateInput = z.infer<typeof offerUpdateSchema>;

export type OfferStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "DISABLED";

export type Offer = OfferCreateInput & BaseEntity & { status: OfferStatus };

/** Single source of truth for public visibility — never persisted, always derived. */
export function computeOfferStatus(
  enabled: boolean,
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  now: Date = new Date(),
): OfferStatus {
  if (!enabled) return "DISABLED";
  if (startDate && now < startDate) return "SCHEDULED";
  if (endDate && now > endDate) return "EXPIRED";
  return "ACTIVE";
}
