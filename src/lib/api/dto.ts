// Backend (Prisma) response shapes and mappers into the frontend view types.
// The frontend components keep their existing typed models; this layer adapts.

import type {
  Property,
  PropertyStatus,
  PropertyType,
  FloorPlan,
  Specification,
  PaymentPlan,
  NearbyLandmark,
  PropertyStat,
  PropertyHighlight,
  SEO,
} from "@/types/property";
import type { Project } from "@/types/project";
import type { GalleryImage, GalleryCategory } from "@/types/gallery";
import type { Testimonial } from "@/types/testimonial";
import type { TeamMember } from "@/types/team";
import type { FAQ } from "@/types/faq";
import type { Amenity } from "@/types/amenity";
import type { BlogPost } from "@/types/blog";

/* ------------------------------ Enum mapping ------------------------------- */

type ApiPropertyStatus =
  | "NEW_LAUNCH"
  | "NOW_SELLING"
  | "READY_TO_MOVE"
  | "COMING_SOON"
  | "SOLD_OUT";
type ApiPropertyType = "APARTMENTS" | "VILLAS" | "PENTHOUSES" | "PLOTS";
type ApiGalleryCategory = "INTERIORS" | "EXTERIORS" | "AMENITIES" | "LIFESTYLE";

const STATUS_LABEL: Record<ApiPropertyStatus, PropertyStatus> = {
  NEW_LAUNCH: "New Launch",
  NOW_SELLING: "Now Selling",
  READY_TO_MOVE: "Ready to Move",
  COMING_SOON: "Coming Soon",
  SOLD_OUT: "Sold Out",
};

const TYPE_LABEL: Record<ApiPropertyType, PropertyType> = {
  APARTMENTS: "Apartments",
  VILLAS: "Villas",
  PENTHOUSES: "Penthouses",
  PLOTS: "Plots",
};

const GALLERY_LABEL: Record<ApiGalleryCategory, Exclude<GalleryCategory, "All">> = {
  INTERIORS: "Interiors",
  EXTERIORS: "Exteriors",
  AMENITIES: "Amenities",
  LIFESTYLE: "Lifestyle",
};

/* ------------------------------- DTO shapes -------------------------------- */

export interface ApiProperty {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  city: string;
  state: string;
  price: number;
  priceLabel: string;
  propertyType: ApiPropertyType;
  status: ApiPropertyStatus;
  bedrooms: string;
  bathrooms: number;
  area: string;
  possession: string;
  reraNumber: string;
  developer: string;
  developerLogo?: string;
  featuredImage: string;
  heroImages: string[];
  video?: string;
  virtualTour?: string;
  brochure?: string;
  masterPlan: string;
  masterLegend: string[];
  certifications: string[];
  featured: boolean;
  order: number;
  gallery: string[];
  amenities: string[];
  floorPlans: FloorPlan[];
  specifications: Specification[];
  paymentPlans: PaymentPlan[];
  nearbyLandmarks: NearbyLandmark[];
  overviewStats: PropertyStat[];
  highlights: PropertyHighlight[];
  lat?: number;
  lng?: number;
  seo: SEO;
  createdAt: string;
  updatedAt: string;
}

export interface ApiGalleryImage {
  id: string;
  src: string;
  alt: string;
  category: ApiGalleryCategory;
  order: number;
  propertyId: string | null;
}

export interface ApiTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  project?: string;
  rating?: number;
  avatar?: string;
}

export interface ApiTeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
}

export interface ApiFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ApiAmenity {
  id: string;
  title: string;
  description: string;
  icon: string;
  category?: string;
}

export interface ApiBlog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: string;
  publishedAt?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiSiteSettings {
  id: string;
  siteName: string;
  phone: string;
  email: string;
  address: string;
  logo?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

/* -------------------------------- Mappers ---------------------------------- */

// The backend returns absolute URLs for CMS-uploaded media, e.g.
// "http://localhost:4000/uploads/2026/07/x.png" (see
// backend/src/storage/LocalStorageProvider.ts). next/image's optimizer
// hard-blocks fetching any remote URL that resolves to a loopback/private
// IP — a security check that can't be satisfied via `images.remotePatterns`
// alone. Stripping the backend's own origin turns these into relative paths
// (e.g. "/uploads/2026/07/x.png"), which next/image treats as same-origin
// and serves via the `/uploads` rewrite in next.config.ts instead of
// fetching remotely. External URLs (Unsplash, etc.) are left untouched.
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(
  /\/api\/?$/,
  "",
);

const IS_DEV = process.env.NODE_ENV !== "production";

export function toLocalAsset<T extends string | undefined>(url: T): T {
  if (!url) return url;

  if (typeof url !== "string") {
    return url;
  }

  // Absolute URLs are already valid and must be used unchanged.
  // This includes Supabase Storage URLs and any other fully-qualified remote URL.
  if (/^https?:\/\//i.test(url)) {
    return url as T;
  }

  // Root-relative uploads paths are the only ones we should prefix with the backend origin.
  if (url.startsWith("/uploads")) {
    return (IS_DEV ? (url as T) : ((`${API_ORIGIN}${url}` as unknown) as T));
  }

  // If the backend returned an absolute URL pointing at our API origin,
  // keep it as-is in production. In development, convert it to a root-relative path
  // so Next's rewrite can proxy it to the local backend.
  if (url.startsWith(API_ORIGIN)) {
    return (IS_DEV ? (url.slice(API_ORIGIN.length) || "/") : (url as T)) as T;
  }

  return url as T;
}

const detailHref = (slug: string): string => `/projects/${slug}`;

export const toProject = (p: ApiProperty): Project => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  subtitle: p.subtitle,
  location: p.location,
  city: p.city,
  status: STATUS_LABEL[p.status],
  propertyType: TYPE_LABEL[p.propertyType],
  priceLabel: p.priceLabel,
  bedrooms: p.bedrooms,
  area: p.area,
  possession: p.possession,
  developer: p.developer,
  featuredImage: toLocalAsset(p.featuredImage),
  featured: p.featured,
  order: p.order,
  href: detailHref(p.slug),
});

export const toProperty = (p: ApiProperty): Property => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  subtitle: p.subtitle,
  description: p.description,
  location: p.location,
  city: p.city,
  state: p.state,
  price: p.price,
  priceLabel: p.priceLabel,
  propertyType: TYPE_LABEL[p.propertyType],
  status: STATUS_LABEL[p.status],
  bedrooms: p.bedrooms,
  bathrooms: p.bathrooms,
  area: p.area,
  possession: p.possession,
  reraNumber: p.reraNumber,
  developer: p.developer,
  developerLogo: toLocalAsset(p.developerLogo),
  featuredImage: toLocalAsset(p.featuredImage),
  // Falls back to the featured image so the hero slider is never empty.
  heroImages: (p.heroImages?.length ? p.heroImages : [p.featuredImage]).map((src) =>
    toLocalAsset(src),
  ),
  gallery: (p.gallery ?? []).map((src) => toLocalAsset(src)),
  video: p.video,
  virtualTour: p.virtualTour,
  floorPlans: (p.floorPlans ?? []).map((f) => ({ ...f, image: toLocalAsset(f.image) })),
  masterPlan: toLocalAsset(p.masterPlan),
  masterLegend: p.masterLegend ?? [],
  certifications: p.certifications ?? [],
  amenities: p.amenities ?? [],
  specifications: p.specifications ?? [],
  paymentPlans: p.paymentPlans ?? [],
  nearbyLandmarks: p.nearbyLandmarks ?? [],
  overviewStats: p.overviewStats ?? [],
  highlights: p.highlights ?? [],
  featured: p.featured ?? false,
  order: p.order ?? 0,
  coordinates: { lat: p.lat ?? 0, lng: p.lng ?? 0 },
  brochure: p.brochure,
  seo: p.seo,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

export const toGalleryImage = (g: ApiGalleryImage): GalleryImage => ({
  id: g.id,
  src: toLocalAsset(g.src),
  alt: g.alt,
  category: GALLERY_LABEL[g.category],
});

export const toTestimonial = (t: ApiTestimonial): Testimonial => ({
  id: t.id,
  quote: t.quote,
  name: t.name,
  role: t.role,
  project: t.project,
  rating: t.rating,
  avatar: toLocalAsset(t.avatar),
});

export const toTeamMember = (m: ApiTeamMember): TeamMember => ({
  id: m.id,
  name: m.name,
  role: m.role,
  image: toLocalAsset(m.image),
  bio: m.bio,
  socials:
    m.linkedin || m.twitter || m.email
      ? { linkedin: m.linkedin, twitter: m.twitter, email: m.email }
      : undefined,
});

export const toFaq = (f: ApiFaq): FAQ => ({
  id: f.id,
  question: f.question,
  answer: f.answer,
  category: f.category,
});

export const toAmenity = (a: ApiAmenity): Amenity => ({
  id: a.id,
  title: a.title,
  description: a.description,
  icon: a.icon,
  category: a.category,
});

export const toBlogPost = (b: ApiBlog): BlogPost => ({
  id: b.id,
  slug: b.slug,
  title: b.title,
  excerpt: b.excerpt,
  content: b.content,
  category: b.category,
  tags: b.tags,
  author: { name: "RENIESINFRA" },
  coverImage: toLocalAsset(b.coverImage),
  readTime: b.readTime,
  published: Boolean(b.publishedAt),
  publishedAt: b.publishedAt ?? b.createdAt,
  seo: {
    metaTitle: b.metaTitle ?? b.title,
    metaDescription: b.metaDescription ?? b.excerpt,
    keywords: b.keywords,
  },
  createdAt: b.createdAt,
  updatedAt: b.updatedAt,
});
