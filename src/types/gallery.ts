// Canonical gallery taxonomy + image model.

export const GALLERY_CATEGORIES = [
  "All",
  "Interiors",
  "Exteriors",
  "Amenities",
  "Lifestyle",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: Exclude<GalleryCategory, "All">;
}
