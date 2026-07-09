import { z } from "zod";
import type { BaseEntity } from "./common";

export const siteSettingsSchema = z.object({
  siteName: z.string().min(1),
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
  logo: z.string().url().optional(),
  facebook: z.string().url().optional(),
  instagram: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  youtube: z.string().url().optional(),
});

// Settings is a singleton; updates are always partial.
export const siteSettingsUpdateSchema = siteSettingsSchema.partial();

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type SiteSettingsUpdateInput = z.infer<typeof siteSettingsUpdateSchema>;
export type SiteSettings = SiteSettingsInput & BaseEntity;
