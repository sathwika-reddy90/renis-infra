export type OfferStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "DISABLED";

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  ctaText?: string;
  ctaLink?: string;
  priority: number;
  status: OfferStatus;
}
