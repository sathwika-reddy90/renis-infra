import type { Project } from "@/types/project";

/** How many projects the homepage hero slider rotates through. */
export const HERO_PROJECT_COUNT = 7;

/**
 * Curation for the hero rail, applied before the split.
 *
 * The API returns projects by `order asc, createdAt desc`, and that order does
 * not currently match the intended rail — "The Aureate" carries `order: 0` and
 * would otherwise take a slider slot from "Elan by Meenakshi". Listing slugs
 * here lifts them to the front, in this exact order.
 *
 * Frontend-only: no database, API, Prisma or property-data change. Empty this
 * array and the split degrades to plain API order, which is what you want once
 * the `Display order` values in the admin match the rail you intend.
 */
export const HERO_PROJECT_SLUGS: readonly string[] = [
  "one-by-msn",
  "the-cascades-neopolis",
  "brigade-neopolis",
  "sattva-lago",
  "poulomi-palazzo",
  "iris-by-raghava",
  "elan-by-meenakshi",
];

/** Curated slugs first (in listed order), then everything else in API order. */
function orderForHome(projects: Project[]): Project[] {
  if (HERO_PROJECT_SLUGS.length === 0) return projects;

  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const lead = HERO_PROJECT_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (p): p is Project => p !== undefined,
  );
  const leadSlugs = new Set(lead.map((p) => p.slug));

  return [...lead, ...projects.filter((p) => !leadSlugs.has(p.slug))];
}

/** The hero slider's projects. */
export function heroProjects(projects: Project[]): Project[] {
  return orderForHome(projects).slice(0, HERO_PROJECT_COUNT);
}

/** Everything the hero slider didn't take — rendered by ProjectShowcase. */
export function cardProjects(projects: Project[]): Project[] {
  return orderForHome(projects).slice(HERO_PROJECT_COUNT);
}
