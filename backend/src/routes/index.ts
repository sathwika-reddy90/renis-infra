import { Router, type RequestHandler } from "express";

import { createCrudRouter } from "./crud.router";
import { createPropertyRouter } from "./property.routes";
import { siteRoutes } from "./site.routes";
import { siteContentRoutes } from "./siteContent.routes";
import { authRoutes } from "./auth.routes";
import { mediaRoutes } from "./media.routes";
import { inquiryRoutes } from "./inquiry.routes";
import { userRoutes } from "./user.routes";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import type { Resource } from "../types/auth";

import {
  galleryService,
  testimonialService,
  teamService,
  faqService,
  amenityService,
  blogService,
} from "../services";

import { galleryCreateSchema, galleryUpdateSchema } from "../types/gallery";
import { testimonialCreateSchema, testimonialUpdateSchema } from "../types/testimonial";
import { teamCreateSchema, teamUpdateSchema } from "../types/team";
import { faqCreateSchema, faqUpdateSchema } from "../types/faq";
import { amenityCreateSchema, amenityUpdateSchema } from "../types/amenity";
import { blogCreateSchema, blogUpdateSchema } from "../types/blog";

// Guard builder — a single, reusable definition of write protection.
const write = (resource: Resource): RequestHandler[] => [authenticate, authorize(resource, "write")];

export const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/media", mediaRoutes);
apiRouter.use("/users", userRoutes);

// Content resources: reads are public (consumed by the public website),
// writes require the right role.
// Properties use a dedicated router — the public site filters, sorts and
// paginates server-side, which the generic CRUD router doesn't support.
apiRouter.use("/properties", createPropertyRouter(write("properties")));
apiRouter.use(
  "/gallery",
  createCrudRouter(galleryService, {
    create: galleryCreateSchema,
    update: galleryUpdateSchema,
    guards: { create: write("gallery"), update: write("gallery"), remove: write("gallery") },
  }),
);
apiRouter.use(
  "/testimonials",
  createCrudRouter(testimonialService, {
    create: testimonialCreateSchema,
    update: testimonialUpdateSchema,
    guards: {
      create: write("testimonials"),
      update: write("testimonials"),
      remove: write("testimonials"),
    },
  }),
);
apiRouter.use(
  "/team",
  createCrudRouter(teamService, {
    create: teamCreateSchema,
    update: teamUpdateSchema,
    guards: { create: write("team"), update: write("team"), remove: write("team") },
  }),
);
apiRouter.use(
  "/faqs",
  createCrudRouter(faqService, {
    create: faqCreateSchema,
    update: faqUpdateSchema,
    guards: { create: write("faqs"), update: write("faqs"), remove: write("faqs") },
  }),
);
apiRouter.use(
  "/blogs",
  createCrudRouter(blogService, {
    create: blogCreateSchema,
    update: blogUpdateSchema,
    guards: { create: write("blogs"), update: write("blogs"), remove: write("blogs") },
  }),
);
apiRouter.use(
  "/amenities",
  createCrudRouter(amenityService, {
    create: amenityCreateSchema,
    update: amenityUpdateSchema,
    guards: { create: write("amenities"), update: write("amenities"), remove: write("amenities") },
  }),
);

// Leads (inquiries): the public contact / "Schedule a Visit" forms may POST;
// the CRM surface (list/get/update/remove/history) is admin-only.
apiRouter.use("/contact", inquiryRoutes);

// Site settings: public read (used by the site), protected write.
apiRouter.use("/site", siteRoutes);

// Marketing copy for the public pages: public read, protected write.
apiRouter.use("/content", siteContentRoutes);
