// Centralized query keys — the single source of truth for caching & invalidation.
export const queryKeys = {
  properties: {
    all: ["properties"] as const,
    list: () => [...queryKeys.properties.all, "list"] as const,
    bySlug: (slug: string) => [...queryKeys.properties.all, "slug", slug] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: () => [...queryKeys.projects.all, "list"] as const,
    /** Filtered/paginated listing — params are part of the key for correctness. */
    page: (params: Record<string, unknown>) =>
      [...queryKeys.projects.all, "page", params] as const,
    facets: () => [...queryKeys.projects.all, "facets"] as const,
    related: (slug: string) => [...queryKeys.projects.all, "related", slug] as const,
  },
  gallery: {
    all: ["gallery"] as const,
    list: () => [...queryKeys.gallery.all, "list"] as const,
  },
  testimonials: {
    all: ["testimonials"] as const,
    list: () => [...queryKeys.testimonials.all, "list"] as const,
  },
  team: {
    all: ["team"] as const,
    list: () => [...queryKeys.team.all, "list"] as const,
  },
  faqs: {
    all: ["faqs"] as const,
    list: () => [...queryKeys.faqs.all, "list"] as const,
  },
  blogs: {
    all: ["blogs"] as const,
    list: () => [...queryKeys.blogs.all, "list"] as const,
    bySlug: (slug: string) => [...queryKeys.blogs.all, "slug", slug] as const,
  },
  amenities: {
    all: ["amenities"] as const,
    list: () => [...queryKeys.amenities.all, "list"] as const,
  },
  offers: {
    all: ["offers"] as const,
    list: () => [...queryKeys.offers.all, "list"] as const,
  },
  site: {
    all: ["site"] as const,
    settings: () => [...queryKeys.site.all, "settings"] as const,
    content: () => [...queryKeys.site.all, "content"] as const,
  },
} as const;
