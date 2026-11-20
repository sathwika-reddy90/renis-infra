import type { Project } from "@/types/project";

/*
 * Project categories — the taxonomy behind the navbar's Projects dropdown and
 * the /projects/category/[category] pages.
 *
 * The backend has no category field, so membership is curated here by slug:
 * the same frontend-only approach as HERO_PROJECT_SLUGS in lib/homeProjects.ts.
 * Categories reference projects and never copy them. Each page renders the
 * live records from /api/properties whose slug is listed, so prices, images
 * and copy stay owned by the CMS.
 *
 * Only list a project when its own data supports the category. A category
 * with no slugs, or whose slugs the API doesn't return, shows an empty state.
 */

export type ProjectCategoryGroupId = "hi-rise" | "villa" | "exclusive";

export interface ProjectCategory {
  /** URL segment: /projects/category/{slug}. Unique across all groups. */
  slug: string;
  label: string;
  /** Slugs of existing projects in this category, in display order. */
  projectSlugs: readonly string[];
}

export interface ProjectCategoryGroup {
  id: ProjectCategoryGroupId;
  label: string;
  /**
   * Prefix that tells same-named categories apart in page titles
   * ("Hi-Rise Ultra Luxury Projects" vs "Villa Ultra Luxury Projects").
   */
  qualifier?: string;
  categories: readonly ProjectCategory[];
}

export const PROJECT_CATEGORY_GROUPS: readonly ProjectCategoryGroup[] = [
  {
    id: "hi-rise",
    label: "Hi-Rise Projects",
    qualifier: "Hi-Rise",
    categories: [
      {
        slug: "hi-rise-ultra-luxury",
        label: "Ultra Luxury Projects",
        // Its own subtitle: "4 & 6 BHK Ultra-Luxury Residences", in three
        // 45-storey towers.
        projectSlugs: ["iris-by-raghava"],
      },
      { slug: "hi-rise-premium", label: "Premium Projects", projectSlugs: [] },
      { slug: "hi-rise-economic", label: "Economic Projects", projectSlugs: [] },
      { slug: "hi-rise-stand-alone", label: "Stand Alone Projects", projectSlugs: [] },
    ],
  },
  {
    id: "villa",
    label: "Villa Projects",
    qualifier: "Villa",
    categories: [
      { slug: "villa-ultra-luxury", label: "Ultra Luxury Projects", projectSlugs: [] },
      { slug: "villa-premium", label: "Premium Projects", projectSlugs: [] },
      { slug: "villa-standard", label: "Standard Projects", projectSlugs: [] },
    ],
  },
  {
    id: "exclusive",
    label: "Exclusive Projects",
    categories: [
      { slug: "renies-commercial-leasing", label: "Renies Commercial Leasing", projectSlugs: [] },
      { slug: "company-owned-properties", label: "Company Owned Properties", projectSlugs: [] },
      {
        slug: "renies-exclusive-properties",
        label: "Renies Exclusive Properties",
        projectSlugs: [],
      },
      { slug: "best-deal-properties", label: "Best Deal Properties", projectSlugs: [] },
    ],
  },
];

export const PROJECT_CATEGORY_SLUGS: readonly string[] = PROJECT_CATEGORY_GROUPS.flatMap((g) =>
  g.categories.map((c) => c.slug),
);

export function categoryHref(slug: string): string {
  return `/projects/category/${slug}`;
}

export function findProjectCategory(
  slug: string,
): { group: ProjectCategoryGroup; category: ProjectCategory } | null {
  for (const group of PROJECT_CATEGORY_GROUPS) {
    const category = group.categories.find((c) => c.slug === slug);
    if (category) return { group, category };
  }
  return null;
}

/** Full name for titles, e.g. "Hi-Rise Ultra Luxury Projects". */
export function categoryTitle(group: ProjectCategoryGroup, category: ProjectCategory): string {
  return group.qualifier ? `${group.qualifier} ${category.label}` : category.label;
}

/**
 * The category's projects in curated order. Slugs the API didn't return
 * (unpublished, renamed) are skipped rather than rendered as broken cards.
 */
export function projectsInCategory(category: ProjectCategory, projects: Project[]): Project[] {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  return category.projectSlugs
    .map((slug) => bySlug.get(slug))
    .filter((p): p is Project => p !== undefined);
}
