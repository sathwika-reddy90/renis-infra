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
  featuredImage: string;
  video?: string;
  virtualTour?: string;
  brochure?: string;
  masterPlan: string;
  masterLegend: string[];
  gallery: string[];
  amenities: string[];
  floorPlans: FloorPlan[];
  specifications: Specification[];
  paymentPlans: PaymentPlan[];
  nearbyLandmarks: NearbyLandmark[];
  overviewStats: PropertyStat[];
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
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

/* -------------------------------- Mappers ---------------------------------- */

// The flagship has a dedicated detail route; others link back to the listing.
const detailHref = (slug: string): string =>
  slug === "the-aureate" ? "/projects/jubilee-hills" : "/projects";

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
  featuredImage: p.featuredImage,
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
  featuredImage: p.featuredImage,
  gallery: p.gallery,
  video: p.video,
  virtualTour: p.virtualTour,
  floorPlans: p.floorPlans,
  masterPlan: p.masterPlan,
  masterLegend: p.masterLegend,
  amenities: p.amenities,
  specifications: p.specifications,
  paymentPlans: p.paymentPlans,
  nearbyLandmarks: p.nearbyLandmarks,
  overviewStats: p.overviewStats,
  coordinates: { lat: p.lat ?? 0, lng: p.lng ?? 0 },
  brochure: p.brochure,
  seo: p.seo,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

export const toGalleryImage = (g: ApiGalleryImage): GalleryImage => ({
  id: g.id,
  src: g.src,
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
  avatar: t.avatar,
});

export const toTeamMember = (m: ApiTeamMember): TeamMember => ({
  id: m.id,
  name: m.name,
  role: m.role,
  image: m.image,
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
  author: { name: "RENISINFRA" },
  coverImage: b.coverImage,
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
