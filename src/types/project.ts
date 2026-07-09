import type { PropertyStatus, PropertyType } from "./property";

// Lightweight listing/summary used by cards and the projects grid.
// Detail-heavy fields live on `Property` (see property.ts).
export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  city: string;
  status: PropertyStatus;
  propertyType: PropertyType;
  priceLabel: string;
  featuredImage: string;
  href: string;
}
