import { authClient as apiClient } from "@/lib/admin/authClient";
import type {
  AdminProperty,
  AdminGalleryImage,
  AdminTestimonial,
  AdminTeamMember,
  AdminFaq,
  AdminAmenity,
  AdminBlog,
  AdminInquiry,
  AdminSiteSettings,
  AdminUserSummary,
  InquiryStatusHistoryEntry,
} from "./types";
import type {
  PropertyInput,
  GalleryInput,
  TestimonialInput,
  TeamInput,
  FaqInput,
  AmenityInput,
  BlogInput,
  InquiryInput,
  SiteSettingsInput,
} from "./schemas";

/** Uniform CRUD surface over the existing backend REST endpoints. */
export interface CrudApi<T, I> {
  list: (signal?: AbortSignal) => Promise<T[]>;
  get: (id: string) => Promise<T>;
  create: (data: I) => Promise<T>;
  update: (id: string, data: Partial<I>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

function makeCrud<T, I>(path: string): CrudApi<T, I> {
  return {
    list: (signal) => apiClient.get<T[]>(path, signal),
    get: (id) => apiClient.get<T>(`${path}/${id}`),
    create: (data) => apiClient.post<T>(path, data),
    update: (id, data) => apiClient.patch<T>(`${path}/${id}`, data),
    remove: (id) => apiClient.delete<void>(`${path}/${id}`),
  };
}

export const adminApi = {
  properties: makeCrud<AdminProperty, PropertyInput>("/properties"),
  gallery: makeCrud<AdminGalleryImage, GalleryInput>("/gallery"),
  testimonials: makeCrud<AdminTestimonial, TestimonialInput>("/testimonials"),
  team: makeCrud<AdminTeamMember, TeamInput>("/team"),
  faqs: makeCrud<AdminFaq, FaqInput>("/faqs"),
  amenities: makeCrud<AdminAmenity, AmenityInput>("/amenities"),
  blogs: makeCrud<AdminBlog, BlogInput>("/blogs"),
  inquiries: makeCrud<AdminInquiry, InquiryInput>("/contact"),
} as const;

/** Site settings is a singleton (GET / PUT), not a CRUD collection. */
export const siteApi = {
  get: (signal?: AbortSignal) => apiClient.get<AdminSiteSettings>("/site", signal),
  update: (data: SiteSettingsInput) => apiClient.put<AdminSiteSettings>("/site", data),
};

/** Read-only directory, for the lead "Assign to" picker. */
export const usersApi = {
  list: (signal?: AbortSignal) => apiClient.get<AdminUserSummary[]>("/users", signal),
};

/** Lead status-change timeline (read-only, nested under a single inquiry). */
export const inquiryHistoryApi = {
  get: (id: string, signal?: AbortSignal) =>
    apiClient.get<InquiryStatusHistoryEntry[]>(`/contact/${id}/history`, signal),
};
