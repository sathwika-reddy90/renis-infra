// Rich property/residence model — the source of truth for detail pages.
// Designed so a future API can populate the same shape with minimal changes.

export type PropertyType = "Apartments" | "Villas" | "Penthouses" | "Plots";

export type PropertyStatus =
  | "New Launch"
  | "Now Selling"
  | "Ready to Move"
  | "Coming Soon"
  | "Sold Out";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface FloorPlan {
  id: string;
  type: string; // e.g. "4 BHK Sky Residence"
  area: string; // e.g. "4,200 sq.ft."
  image: string;
  details: string[];
  price?: string;
}

export interface PaymentPlan {
  id: string;
  label: string;
  description: string;
  milestone?: string;
}

export interface NearbyLandmark {
  place: string;
  distance: string; // e.g. "1.2 km"
  category?: string;
}

export interface Specification {
  category: string; // e.g. "Structure", "Flooring"
  items: string[];
}

/** A single label/value stat shown in the overview grid. */
export interface PropertyStat {
  label: string;
  value: string;
}

export interface SEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
}

export interface Property {
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
  propertyType: PropertyType;
  status: PropertyStatus;
  bedrooms: string;
  bathrooms: number;
  area: string;
  possession: string;
  reraNumber: string;
  developer: string;
  featuredImage: string;
  gallery: string[];
  video?: string;
  virtualTour?: string;
  floorPlans: FloorPlan[];
  masterPlan: string;
  masterLegend: string[];
  amenities: string[];
  specifications: Specification[];
  paymentPlans: PaymentPlan[];
  nearbyLandmarks: NearbyLandmark[];
  coordinates: Coordinates;
  brochure?: string;
  overviewStats: PropertyStat[];
  seo: SEO;
  createdAt: string;
  updatedAt: string;
}
