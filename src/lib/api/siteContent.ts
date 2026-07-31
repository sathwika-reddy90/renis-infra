import { apiClient } from "./client";
import { toLocalAsset } from "./dto";

/*
 * Marketing copy for the public pages. Everything here used to live as
 * hardcoded literals under src/config/*.ts; it is now editable at
 * /admin/content and served from GET /api/content.
 */

export interface Cta {
  label: string;
  href: string;
}

export interface LandingHero {
  image: string;
  eyebrow: string;
  headline: string;
  headlineHighlight: string;
  subheadline: string;
  cta: Cta;
}

export interface HeroSlide {
  category: string;
  image: string;
  title: string;
  location: string;
  cta: Cta;
}

export interface LaunchContent {
  eyebrow: string;
  name: string;
  location: string;
  description: string;
  image: string;
  discoverHref: string;
  registerHref: string;
}

export interface StatItem {
  icon: string;
  stat: string;
  label: string;
}

export interface AboutContent {
  storyTitle: string;
  storyBody: string[];
  visionMission: { kind: string; title: string; text: string }[];
  whyChoose: { title: string; desc: string }[];
  stats: { stat: string; label: string }[];
}

export interface TimelineItem {
  year: string;
  title: string;
  text: string;
}

export interface Office {
  city: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
}

export interface CtaBand {
  key: string;
  title: string;
  description?: string;
  image?: string;
  cta: Cta;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteContent {
  landingHero: LandingHero;
  heroSlides: HeroSlide[];
  launch: LaunchContent;
  whyUs: StatItem[];
  invest: StatItem[];
  about: AboutContent;
  timeline: TimelineItem[];
  offices: Office[];
  ctaBands: CtaBand[];
  nav: NavItem[];
}

export async function fetchSiteContent(signal?: AbortSignal): Promise<SiteContent> {
  const data = await apiClient.get<SiteContent>("/content", signal);
  // Every image may be a CMS upload, so it needs the same origin-stripping
  // that dto.ts applies to property/gallery media.
  return {
    ...data,
    landingHero: { ...data.landingHero, image: toLocalAsset(data.landingHero.image) },
    heroSlides: (data.heroSlides ?? []).map((s) => ({ ...s, image: toLocalAsset(s.image) })),
    launch: { ...data.launch, image: toLocalAsset(data.launch.image) },
    ctaBands: (data.ctaBands ?? []).map((b) => ({ ...b, image: toLocalAsset(b.image) })),
  };
}

/** Looks up a CTA band by key, so pages degrade gracefully if one is removed. */
export function findCtaBand(content: SiteContent | undefined, key: string): CtaBand | undefined {
  return content?.ctaBands?.find((b) => b.key === key);
}
