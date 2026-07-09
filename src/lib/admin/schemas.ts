import { z } from "zod";
import { PROPERTY_TYPES, PROPERTY_STATUSES, GALLERY_CATEGORIES, BLOG_STATUSES } from "./types";

/* ------------------------------ shared helpers ------------------------------ */

const req = (message = "Required") => z.string().min(1, message);
const url = () => z.string().url("Enter a valid URL");

/** Treats empty strings from inputs as "not provided" for optional fields. */
const emptyOptional = <S extends z.ZodTypeAny>(schema: S) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : (v ?? undefined)),
    schema.optional(),
  );

const optUrl = () => emptyOptional(url());
const optStr = () => emptyOptional(z.string());
const optNum = () => emptyOptional(z.coerce.number());
const intField = (min = 0) => z.coerce.number().int().min(min);

/* --------------------------------- property --------------------------------- */

export const propertySchema = z.object({
  title: req(),
  slug: req().regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  subtitle: req(),
  description: req(),
  location: req(),
  city: req(),
  state: req(),
  price: intField(),
  priceLabel: req(),
  propertyType: z.enum(PROPERTY_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  bedrooms: req(),
  bathrooms: intField(),
  area: req(),
  possession: req(),
  reraNumber: req(),
  developer: req(),
  featuredImage: url(),
  video: optUrl(),
  virtualTour: optUrl(),
  brochure: optStr(),
  masterPlan: req("Master plan image is required"),
  masterLegend: z.array(z.string()).default([]),
  gallery: z.array(url()).default([]),
  amenities: z.array(z.string()).default([]),
  floorPlans: z
    .array(
      z.object({
        id: optStr(),
        type: req(),
        area: req(),
        image: url(),
        price: optStr(),
        details: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  specifications: z
    .array(z.object({ category: req(), items: z.array(z.string()).default([]) }))
    .default([]),
  paymentPlans: z
    .array(z.object({ id: optStr(), label: req(), description: req(), milestone: optStr() }))
    .default([]),
  nearbyLandmarks: z
    .array(z.object({ place: req(), distance: req(), category: optStr() }))
    .default([]),
  overviewStats: z.array(z.object({ label: req(), value: req() })).default([]),
  lat: optNum(),
  lng: optNum(),
  seo: z.object({
    metaTitle: req(),
    metaDescription: req(),
    keywords: z.array(z.string()).default([]),
    ogImage: optUrl(),
  }),
});
export type PropertyInput = z.infer<typeof propertySchema>;

/* ------------------------------ other resources ----------------------------- */

export const gallerySchema = z.object({
  src: url(),
  alt: req(),
  category: z.enum(GALLERY_CATEGORIES),
  order: intField(),
});
export type GalleryInput = z.infer<typeof gallerySchema>;

export const testimonialSchema = z.object({
  quote: req(),
  name: req(),
  role: req(),
  project: optStr(),
  rating: emptyOptional(z.coerce.number().int().min(1).max(5)),
  avatar: optUrl(),
  featured: z.boolean().default(false),
});
export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const teamSchema = z.object({
  name: req(),
  role: req(),
  image: url(),
  bio: optStr(),
  linkedin: optUrl(),
  twitter: optUrl(),
  email: emptyOptional(z.string().email("Enter a valid email")),
  order: intField(),
});
export type TeamInput = z.infer<typeof teamSchema>;

export const faqSchema = z.object({
  question: req(),
  answer: req(),
  category: req(),
  order: intField(),
});
export type FaqInput = z.infer<typeof faqSchema>;

export const amenitySchema = z.object({
  title: req(),
  description: req(),
  icon: req("Pick an icon"),
  category: optStr(),
});
export type AmenityInput = z.infer<typeof amenitySchema>;

export const blogSchema = z.object({
  title: req(),
  slug: req().regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  excerpt: req(),
  content: req(),
  category: req(),
  tags: z.array(z.string()).default([]),
  coverImage: url(),
  readTime: req(),
  status: z.enum(BLOG_STATUSES),
  publishedAt: optStr(),
  authorId: optStr(),
  metaTitle: optStr(),
  metaDescription: optStr(),
  keywords: z.array(z.string()).default([]),
});
export type BlogInput = z.infer<typeof blogSchema>;

export const siteSettingsSchema = z.object({
  siteName: req(),
  phone: req(),
  email: z.string().email("Enter a valid email"),
  address: req(),
  logo: optUrl(),
  facebook: optUrl(),
  instagram: optUrl(),
  linkedin: optUrl(),
  youtube: optUrl(),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

/** Inquiry updates are inline CRM edits; creates come from the public forms. */
export type InquiryInput = {
  name: string;
  email: string;
  phone: string;
  message?: string;
  interest?: string;
  status?: string;
  assignedToId?: string | null;
  followUpDate?: string | null;
  notes?: string | null;
  visitDate?: string | null;
  visitTime?: string | null;
};
