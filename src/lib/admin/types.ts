// Raw backend DTO shapes for the Admin CMS. The admin edits data in the
// backend's native format (raw enums), unlike the public site which maps
// DTOs into display models.

export const PROPERTY_TYPES = ["APARTMENTS", "VILLAS", "PENTHOUSES", "PLOTS"] as const;
export const PROPERTY_STATUSES = [
  "NEW_LAUNCH",
  "NOW_SELLING",
  "READY_TO_MOVE",
  "COMING_SOON",
  "SOLD_OUT",
] as const;
export const GALLERY_CATEGORIES = ["INTERIORS", "EXTERIORS", "AMENITIES", "LIFESTYLE"] as const;
export const BLOG_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const INQUIRY_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "VISIT_SCHEDULED",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;

export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number];
export type PropertyStatusValue = (typeof PROPERTY_STATUSES)[number];
export type GalleryCategoryValue = (typeof GALLERY_CATEGORIES)[number];
export type BlogStatusValue = (typeof BLOG_STATUSES)[number];
export type InquiryStatusValue = (typeof INQUIRY_STATUSES)[number];

export interface AdminEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFloorPlan {
  id?: string;
  type: string;
  area: string;
  image: string;
  details: string[];
  price?: string;
}

export interface AdminProperty extends AdminEntity {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  city: string;
  state: string;
  price: number;
  priceLabel: string;
  propertyType: PropertyTypeValue;
  status: PropertyStatusValue;
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
  floorPlans: AdminFloorPlan[];
  specifications: { category: string; items: string[] }[];
  paymentPlans: { id?: string; label: string; description: string; milestone?: string }[];
  nearbyLandmarks: { place: string; distance: string; category?: string }[];
  overviewStats: { label: string; value: string }[];
  lat?: number;
  lng?: number;
  seo: { metaTitle: string; metaDescription: string; keywords: string[]; ogImage?: string };
}

export interface AdminGalleryImage extends AdminEntity {
  src: string;
  alt: string;
  category: GalleryCategoryValue;
  order: number;
  propertyId?: string | null;
}

export interface AdminTestimonial extends AdminEntity {
  quote: string;
  name: string;
  role: string;
  project?: string;
  rating?: number;
  avatar?: string;
  featured: boolean;
  propertyId?: string | null;
}

export interface AdminTeamMember extends AdminEntity {
  name: string;
  role: string;
  image: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
  order: number;
}

export interface AdminFaq extends AdminEntity {
  question: string;
  answer: string;
  category: string;
  order: number;
  propertyId?: string | null;
}

export interface AdminAmenity extends AdminEntity {
  title: string;
  description: string;
  icon: string;
  category?: string;
}

export interface AdminBlog extends AdminEntity {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: string;
  status: BlogStatusValue;
  publishedAt?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  authorId?: string | null;
}

export interface AdminInquiry extends AdminEntity {
  name: string;
  email: string;
  phone: string;
  message?: string;
  interest?: string;
  status: InquiryStatusValue;
  propertyId?: string | null;
  assignedToId?: string | null;
  followUpDate?: string;
  notes?: string;
  visitDate?: string;
  visitTime?: string;
}

export interface InquiryStatusHistoryEntry {
  id: string;
  fromStatus: InquiryStatusValue | null;
  toStatus: InquiryStatusValue;
  changedById: string | null;
  createdAt: string;
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AdminSiteSettings extends AdminEntity {
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

export const MEDIA_TYPES = ["IMAGE", "VIDEO", "DOCUMENT"] as const;
export type MediaTypeValue = (typeof MEDIA_TYPES)[number];

export interface AdminMedia extends AdminEntity {
  provider: string;
  url: string;
  thumbnailUrl: string | null;
  fileName: string;
  mimeType: string;
  type: MediaTypeValue;
  size: number;
  width: number | null;
  height: number | null;
}
