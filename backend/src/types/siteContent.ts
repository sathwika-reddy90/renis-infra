import { z } from "zod";
import type { BaseEntity } from "./common";

/*
 * Editorial copy for the marketing pages. Everything here used to live as
 * hardcoded literals under the frontend's src/config/*.ts, which meant a
 * deploy was required to change a headline. Each top-level key is an
 * independent JSON group so one section can be saved without touching others.
 */

const cta = z.object({
  label: z.string(),
  href: z.string(),
});

export const landingHeroSchema = z.object({
  image: z.string(),
  eyebrow: z.string(),
  headline: z.string(),
  headlineHighlight: z.string(),
  subheadline: z.string(),
  cta,
});

export const heroSlideSchema = z.object({
  category: z.string(),
  image: z.string(),
  title: z.string(),
  location: z.string(),
  cta,
});

export const launchSchema = z.object({
  eyebrow: z.string(),
  name: z.string(),
  location: z.string(),
  description: z.string(),
  image: z.string(),
  discoverHref: z.string(),
  registerHref: z.string(),
});

/** Icon keys resolve against the frontend's lucide registry. */
export const statItemSchema = z.object({
  icon: z.string(),
  stat: z.string(),
  label: z.string(),
});

export const aboutSchema = z.object({
  storyTitle: z.string(),
  storyBody: z.array(z.string()),
  visionMission: z.array(
    z.object({ kind: z.string(), title: z.string(), text: z.string() }),
  ),
  whyChoose: z.array(z.object({ title: z.string(), desc: z.string() })),
  stats: z.array(z.object({ stat: z.string(), label: z.string() })),
});

export const timelineItemSchema = z.object({
  year: z.string(),
  title: z.string(),
  text: z.string(),
});

export const officeSchema = z.object({
  city: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  hours: z.string(),
});

/** Reusable CTA bands, addressed by `key` from the page that renders them. */
export const ctaBandSchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  cta,
});

export const navItemSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const siteContentSchema = z.object({
  landingHero: landingHeroSchema,
  heroSlides: z.array(heroSlideSchema).default([]),
  launch: launchSchema,
  whyUs: z.array(statItemSchema).default([]),
  invest: z.array(statItemSchema).default([]),
  about: aboutSchema,
  timeline: z.array(timelineItemSchema).default([]),
  offices: z.array(officeSchema).default([]),
  ctaBands: z.array(ctaBandSchema).default([]),
  nav: z.array(navItemSchema).default([]),
});

// Singleton; updates are always partial so the admin can save one tab at a time.
export const siteContentUpdateSchema = siteContentSchema.partial();

export type SiteContentInput = z.infer<typeof siteContentSchema>;
export type SiteContentUpdateInput = z.infer<typeof siteContentUpdateSchema>;
export type SiteContent = SiteContentInput & BaseEntity;
