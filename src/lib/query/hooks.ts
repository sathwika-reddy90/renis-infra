import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";

import { fetchProjects, fetchProperties, fetchPropertyBySlug } from "@/lib/api/properties";
import { fetchGallery } from "@/lib/api/gallery";
import { fetchTestimonials } from "@/lib/api/testimonials";
import { fetchTeam } from "@/lib/api/team";
import { fetchFaqs } from "@/lib/api/faqs";
import { fetchBlogs, fetchBlogBySlug } from "@/lib/api/blogs";
import { fetchAmenities } from "@/lib/api/amenities";
import { fetchSiteSettings } from "@/lib/api/site";
import { submitInquiry } from "@/lib/api/contact";

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: ({ signal }) => fetchProjects(signal),
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

export function useSiteSettings() {
  return useQuery({
    queryKey: queryKeys.site.settings(),
    queryFn: ({ signal }) => fetchSiteSettings(signal),
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
