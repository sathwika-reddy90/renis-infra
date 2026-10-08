import type { Project } from "@/types/project";

/**
 * How many projects the homepage hero slider rotates through.
 * Infinity: every homepage project rides the hero's pinned scroll, and
 * ProjectShowcase (the former second layout) receives nothing.
 */
export const HERO_PROJECT_COUNT = Infinity;

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
  "the-trilight",
  "high-9",
  "prestige-budvel",
  "prestige-golden-grove",
];

export interface MobileArt {
  src: string;
  /**
   * Vertical focal point used when a short phone has to trim the render
   * (CSS `object-position` y). Defaults to 25%; higher trims more from the
   * top and keeps more of the bottom.
   */
  focus?: string;
}

/**
 * Portrait artwork for the hero slider on phones, keyed by slug. Served from
 * `public/`; desktop keeps the project's `featuredImage`. A slug without an
 * entry keeps the desktop image on phones too.
 */
export const HERO_MOBILE_IMAGES: Readonly<Record<string, MobileArt>> = {
  "one-by-msn": { src: "/images/projects/mobile/one-by-msn.jpg" },
  // Tower base sits low (≈87%) and the title runs nearly edge to edge.
  "the-cascades-neopolis": { src: "/images/projects/mobile/the-cascades-neopolis.jpg", focus: "30%" },
  "brigade-neopolis": { src: "/images/projects/mobile/brigade-neopolis.jpg" },
  // Towers run down to ≈90%; split the trim so their bases stay in frame.
  "sattva-lago": { src: "/images/projects/mobile/sattva-lago.jpg", focus: "55%" },
  "poulomi-palazzo": { src: "/images/projects/mobile/poulomi-palazzo.jpg" },
  "iris-by-raghava": { src: "/images/projects/mobile/iris-by-raghava.jpg" },
  "elan-by-meenakshi": { src: "/images/projects/mobile/elan-by-meenakshi.jpg" },
  "the-trilight": { src: "/images/projects/mobile/the-trilight.jpg" },
  "high-9": { src: "/images/projects/mobile/high-9.jpg" },
  // Gate signage and street sit at the very bottom (≈82–94%); trim the sky.
  "prestige-budvel": { src: "/images/projects/mobile/prestige-budvel.jpg", focus: "65%" },
  "prestige-golden-grove": { src: "/images/projects/mobile/prestige-golden-grove.jpg" },
};

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
