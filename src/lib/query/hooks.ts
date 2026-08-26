import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";

import {
  fetchProjectFacets,
  fetchProjectPage,
  fetchProjects,
  fetchProperties,
  fetchPropertyBySlug,
  fetchRelatedProjects,
  type ProjectQuery,
} from "@/lib/api/properties";
import { fetchGallery } from "@/lib/api/gallery";
import { fetchTestimonials } from "@/lib/api/testimonials";
import { fetchTeam } from "@/lib/api/team";
import { fetchFaqs } from "@/lib/api/faqs";
import { fetchBlogs, fetchBlogBySlug } from "@/lib/api/blogs";
import { fetchAmenities } from "@/lib/api/amenities";
import { fetchOffers } from "@/lib/api/offers";
import { fetchSiteSettings } from "@/lib/api/site";
import { fetchSiteContent } from "@/lib/api/siteContent";
import { submitInquiry } from "@/lib/api/contact";

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: ({ signal }) => fetchProjects(signal),
  });
}

/** Filtered, paginated listing. Server-side filtering via /api/properties. */
export function useProjectPage(query: ProjectQuery) {
  return useQuery({
    queryKey: queryKeys.projects.page(query as Record<string, unknown>),
    queryFn: ({ signal }) => fetchProjectPage(query, signal),
    // Keeps the previous page on screen while the next one loads, instead of
    // collapsing the grid to skeletons on every filter change.
    placeholderData: (prev) => prev,
  });
}

/** Filter options derived from live data rather than a static config list. */
export function useProjectFacets() {
  return useQuery({
    queryKey: queryKeys.projects.facets(),
    queryFn: ({ signal }) => fetchProjectFacets(signal),
    staleTime: 5 * 60_000,
  });
}

export function useRelatedProjects(slug: string, limit = 3) {
  return useQuery({
    queryKey: queryKeys.projects.related(slug),
    queryFn: ({ signal }) => fetchRelatedProjects(slug, limit, signal),
    enabled: slug.length > 0,
  });
}

export function useProperties() {
  return useQuery({
    queryKey: queryKeys.properties.list(),
    queryFn: ({ signal }) => fetchProperties(signal),
  });
}

export function usePropertyBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.properties.bySlug(slug),
    queryFn: ({ signal }) => fetchPropertyBySlug(slug, signal),
    enabled: slug.length > 0,
  });
}

export function useGallery() {
  return useQuery({
    queryKey: queryKeys.gallery.list(),
    queryFn: ({ signal }) => fetchGallery(signal),
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: queryKeys.testimonials.list(),
    queryFn: ({ signal }) => fetchTestimonials(signal),
  });
}

export function useTeam() {
  return useQuery({
    queryKey: queryKeys.team.list(),
    queryFn: ({ signal }) => fetchTeam(signal),
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: queryKeys.faqs.list(),
    queryFn: ({ signal }) => fetchFaqs(signal),
  });
}

export function useBlogs() {
  return useQuery({
    queryKey: queryKeys.blogs.list(),
    queryFn: ({ signal }) => fetchBlogs(signal),
  });
}

export function useBlogBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.blogs.bySlug(slug),
    queryFn: ({ signal }) => fetchBlogBySlug(slug, signal),
    enabled: slug.length > 0,
  });
}

export function useAmenities() {
  return useQuery({
    queryKey: queryKeys.amenities.list(),
    queryFn: ({ signal }) => fetchAmenities(signal),
  });
}

export function useOffers() {
  return useQuery({
    queryKey: queryKeys.offers.list(),
    queryFn: ({ signal }) => fetchOffers(signal),
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: queryKeys.site.settings(),
    queryFn: ({ signal }) => fetchSiteSettings(signal),
  });
}

/**
 * Marketing copy for the public pages. Read on nearly every route, and it
 * changes rarely, so it is cached far longer than the default 60s.
 */
export function useSiteContent() {
  return useQuery({
    queryKey: queryKeys.site.content(),
    queryFn: ({ signal }) => fetchSiteContent(signal),
    staleTime: 10 * 60_000,
  });
}

export function useSubmitInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitInquiry,
    onSuccess: () => {
      // Inquiries would be re-fetched by any admin view; invalidate defensively.
      queryClient.invalidateQueries({ queryKey: ["contact"] });
    },
  });
}
