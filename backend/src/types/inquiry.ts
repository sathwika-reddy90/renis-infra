import { z } from "zod";
import type { BaseEntity } from "./common";
import { InquiryStatusSchema } from "./enums";

// Public-facing create payload (contact form + "Schedule a Visit"). `status`
// defaults to NEW; visit date/time are the customer's preferred slot.
export const inquiryCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  message: z.string().optional(),
  interest: z.string().optional(),
  status: InquiryStatusSchema.default("NEW"),
  propertyId: z.string().nullable().optional(),
  visitDate: z.coerce.date().optional(),
  visitTime: z.string().optional(),
});

// Admin-side CRM fields, layered on top of the public fields. `status`
// changes are recorded to the lead's timeline by the repository.
export const inquiryUpdateSchema = inquiryCreateSchema.partial().extend({
  assignedToId: z.string().nullable().optional(),
  followUpDate: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  visitDate: z.coerce.date().nullable().optional(),
  visitTime: z.string().nullable().optional(),
});

export type InquiryCreateInput = z.infer<typeof inquiryCreateSchema>;
export type InquiryUpdateInput = z.infer<typeof inquiryUpdateSchema>;

export interface Inquiry extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  message?: string;
  interest?: string;
  status: z.infer<typeof InquiryStatusSchema>;
  propertyId?: string | null;
  assignedToId?: string | null;
  followUpDate?: Date;
  notes?: string;
  visitDate?: Date;
  visitTime?: string;
}

export interface InquiryStatusHistoryEntry {
  id: string;
  fromStatus: Inquiry["status"] | null;
  toStatus: Inquiry["status"];
  changedById: string | null;
  createdAt: Date;
}
