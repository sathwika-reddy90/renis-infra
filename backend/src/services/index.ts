import { BaseService } from "./base.service";

import { propertyRepository } from "../repositories/property.repository";
import { galleryRepository } from "../repositories/gallery.repository";
import { testimonialRepository } from "../repositories/testimonial.repository";
import { teamRepository } from "../repositories/team.repository";
import { faqRepository } from "../repositories/faq.repository";
import { amenityRepository } from "../repositories/amenity.repository";
import { blogRepository } from "../repositories/blog.repository";
import { offerRepository } from "../repositories/offer.repository";

import type { Property, PropertyCreateInput, PropertyUpdateInput } from "../types/property";
import type { GalleryImage, GalleryCreateInput, GalleryUpdateInput } from "../types/gallery";
import type {
  Testimonial,
  TestimonialCreateInput,
  TestimonialUpdateInput,
} from "../types/testimonial";
import type { TeamMember, TeamCreateInput, TeamUpdateInput } from "../types/team";
import type { FAQ, FaqCreateInput, FaqUpdateInput } from "../types/faq";
import type { Amenity, AmenityCreateInput, AmenityUpdateInput } from "../types/amenity";
import type { Blog, BlogCreateInput, BlogUpdateInput } from "../types/blog";
import type { Offer, OfferCreateInput, OfferUpdateInput } from "../types/offer";

export const propertyService = new BaseService<Property, PropertyCreateInput, PropertyUpdateInput>(
  propertyRepository,
  "Property",
);

export const galleryService = new BaseService<
  GalleryImage,
  GalleryCreateInput,
  GalleryUpdateInput
>(galleryRepository, "Gallery image");

export const testimonialService = new BaseService<
  Testimonial,
  TestimonialCreateInput,
  TestimonialUpdateInput
>(testimonialRepository, "Testimonial");

export const teamService = new BaseService<TeamMember, TeamCreateInput, TeamUpdateInput>(
  teamRepository,
  "Team member",
);

export const faqService = new BaseService<FAQ, FaqCreateInput, FaqUpdateInput>(faqRepository, "FAQ");

export const amenityService = new BaseService<Amenity, AmenityCreateInput, AmenityUpdateInput>(
  amenityRepository,
  "Amenity",
);

export const blogService = new BaseService<Blog, BlogCreateInput, BlogUpdateInput>(
  blogRepository,
  "Blog",
);

export const offerService = new BaseService<Offer, OfferCreateInput, OfferUpdateInput>(
  offerRepository,
  "Offer",
);

export { siteService } from "./site.service";
export { siteContentService } from "./siteContent.service";
export { inquiryService } from "./inquiry.service";
