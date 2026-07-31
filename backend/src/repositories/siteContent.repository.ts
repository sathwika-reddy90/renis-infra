import { Prisma, type SiteContent as SiteContentRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { run } from "../utils/prismaError";
import type { SiteContent, SiteContentInput, SiteContentUpdateInput } from "../types/siteContent";

// One fixed row backs the singleton content resource, mirroring site.repository.
const SINGLETON_ID = "site-content";

const json = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

const img = (id: string, w = 2000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/**
 * Seed copy, carried over verbatim from the frontend's former src/config/*.ts
 * literals so the site renders identically on first boot. Editors overwrite
 * this through /admin/content.
 */
const SEED: SiteContentInput = {
  landingHero: {
    image: img("1600210491892-03d54c0aaf87"),
    eyebrow: "Hyderabad, India",
    headline: "Live Where Luxury",
    headlineHighlight: "Meets Legacy",
    subheadline:
      "RENISINFRA presents landmark residences crafted for those who expect nothing less than extraordinary.",
    cta: { label: "Explore Residences", href: "/projects" },
  },
  heroSlides: [
    {
      category: "Entrance",
      image: img("1600585153490-76fb20a32601"),
      title: "Signature Addresses",
      location: "Kokapet · Neopolis · Financial District",
      cta: { label: "Discover Projects", href: "/projects" },
    },
    {
      category: "Villa",
      image: img("1600047509807-ba8f99d2cdde"),
      title: "Luxury Villas",
      location: "Gated Estates · Private Landscapes",
      cta: { label: "Discover Projects", href: "/projects" },
    },
    {
      category: "Balcony",
      image: img("1613490493576-7fde63acd811"),
      title: "Sky Residences",
      location: "Panoramic City & Skyline Views",
      cta: { label: "Discover Projects", href: "/projects" },
    },
    {
      category: "Exterior",
      image: img("1600566752355-35792bedcfea"),
      title: "West Hyderabad Collection",
      location: "The City's Most Coveted Corridor",
      cta: { label: "Schedule a Visit", href: "/contact" },
    },
  ],
  launch: {
    eyebrow: "Latest Launch",
    name: "Now Open for Registrations",
    location: "Kokapet, Hyderabad",
    description:
      "A limited collection of sky residences in West Hyderabad's most coveted corridor, where privacy, provenance and panoramic views come as standard.",
    image: img("1600585152220-90363fe7e115"),
    discoverHref: "/projects",
    registerHref: "/contact",
  },
  whyUs: [
    { icon: "years", stat: "18+", label: "Years of Craftsmanship" },
    { icon: "residences", stat: "42+", label: "Landmark Residences" },
    { icon: "sqft", stat: "3.2M", label: "Sq.Ft. Delivered" },
    { icon: "families", stat: "6,500+", label: "Families at Home" },
    { icon: "delivery", stat: "100%", label: "On-Time Handovers" },
    { icon: "awards", stat: "15+", label: "Design Awards" },
    { icon: "amenities", stat: "40+", label: "Premium Amenities" },
    { icon: "locations", stat: "6", label: "Signature Addresses" },
  ],
  invest: [
    { icon: "location", stat: "12+", label: "Prime Locations" },
    { icon: "roi", stat: "9.5%", label: "Avg. Rental ROI" },
    { icon: "shield", stat: "100%", label: "RERA Approved" },
    { icon: "clock", stat: "0", label: "Delayed Handovers" },
    { icon: "freehold", stat: "100%", label: "Freehold Ownership" },
    { icon: "interest", stat: "0%", label: "Interest-Free Plans" },
    { icon: "growth", stat: "30+", label: "Years of Legacy Value" },
    { icon: "support", stat: "24/7", label: "Advisor Support" },
  ],
  about: {
    storyTitle: "Who We Are",
    storyBody: [
      "RENISINFRA was founded in 2007 on a simple conviction: that a home should be judged not by the year it was built, but by how well it lives a decade later.",
      "Since then we have delivered landmark residences across Hyderabad's most sought-after corridors — each one shaped by acclaimed architects, engineered honestly, and handed over on the date we promised.",
    ],
    visionMission: [
      {
        kind: "Vision",
        title: "To redefine the address.",
        text: "To be the most trusted name in luxury real estate — creating landmarks that appreciate in value and in the quality of life they offer, for generations to come.",
      },
      {
        kind: "Mission",
        title: "Craft over compromise.",
        text: "To deliver residences of uncompromising quality through honest engineering, acclaimed design and a service culture that treats every resident as a lifelong client.",
      },
    ],
    whyChoose: [
      { title: "Design-Led", desc: "Every project begins with acclaimed architects and a singular design intent." },
      { title: "On-Time Delivery", desc: "A track record of handovers ahead of schedule, without cutting specification." },
      { title: "Prime Addresses", desc: "We acquire only the city's most coveted, well-connected land parcels." },
      { title: "Transparent Dealings", desc: "Clear pricing, clean titles and documented commitments at every step." },
      { title: "Enduring Quality", desc: "Materials and finishes chosen to remain relevant for decades, not seasons." },
      { title: "Lifelong Service", desc: "A dedicated concierge and facilities team long after you move in." },
    ],
    stats: [
      { stat: "18+", label: "Years of Craftsmanship" },
      { stat: "42", label: "Landmark Residences" },
      { stat: "3.2M", label: "Sq.Ft. Delivered" },
      { stat: "6,500+", label: "Families at Home" },
    ],
  },
  timeline: [
    { year: "2007", title: "The Beginning", text: "RENISINFRA is founded with a single boutique residence in Banjara Hills." },
    { year: "2012", title: "First Landmark", text: "Delivery of Celeste Towers establishes our reputation for quality." },
    { year: "2017", title: "Scaling Craft", text: "Crossed 1 million sq.ft. delivered across the city's prime corridors." },
    { year: "2021", title: "The Kokapet Era", text: "Expansion into West Hyderabad's fastest-appreciating corridor." },
    { year: "2026", title: "Today", text: "42 landmark residences and 6,500+ families who call a RENISINFRA home." },
  ],
  offices: [
    {
      city: "Head Office · Jubilee Hills",
      address: "Road No. 45, Jubilee Hills, Hyderabad 500033",
      phone: "+91 90000 12345",
      email: "residences@renisinfra.com",
      hours: "Mon – Sat · 10:00 AM – 7:00 PM",
    },
    {
      city: "Experience Centre · Gachibowli",
      address: "DLF Cyber City, Gachibowli, Hyderabad 500032",
      phone: "+91 90000 67890",
      email: "gachibowli@renisinfra.com",
      hours: "Mon – Sun · 10:00 AM – 8:00 PM",
    },
  ],
  ctaBands: [
    {
      key: "gallery",
      title: "Photographs only tell half the story.",
      description: "Walk the residence in person and feel the proportions, light and finish for yourself.",
      cta: { label: "Schedule a Visit", href: "/contact" },
    },
    {
      key: "projects",
      title: "Can't find the right residence?",
      description: "Tell us what you're looking for and a residence advisor will curate a shortlist.",
      cta: { label: "Talk to an Advisor", href: "/contact" },
    },
    {
      key: "blog",
      title: "Never miss a launch.",
      description: "Be the first to hear about new addresses, previews and private viewings.",
      cta: { label: "Register Interest", href: "/contact" },
    },
    {
      key: "about",
      title: "Discover a residence worthy of your story.",
      description: "Explore the collection or speak with an advisor about what suits you best.",
      cta: { label: "View Projects", href: "/projects" },
    },
    {
      key: "contact",
      title: "Prefer to visit in person?",
      description: "Our experience centres are open through the week.",
      cta: { label: "Schedule a Visit", href: "/contact" },
    },
  ],
  nav: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
    { label: "Media", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ],
};

const CREATE_DEFAULTS: Prisma.SiteContentCreateInput = {
  id: SINGLETON_ID,
  landingHero: json(SEED.landingHero),
  heroSlides: json(SEED.heroSlides),
  launch: json(SEED.launch),
  whyUs: json(SEED.whyUs),
  invest: json(SEED.invest),
  about: json(SEED.about),
  timeline: json(SEED.timeline),
  offices: json(SEED.offices),
  ctaBands: json(SEED.ctaBands),
  nav: json(SEED.nav),
};

function toDto(row: SiteContentRow): SiteContent {
  return {
    id: row.id,
    landingHero: row.landingHero as unknown as SiteContent["landingHero"],
    heroSlides: row.heroSlides as unknown as SiteContent["heroSlides"],
    launch: row.launch as unknown as SiteContent["launch"],
    whyUs: row.whyUs as unknown as SiteContent["whyUs"],
    invest: row.invest as unknown as SiteContent["invest"],
    about: row.about as unknown as SiteContent["about"],
    timeline: row.timeline as unknown as SiteContent["timeline"],
    offices: row.offices as unknown as SiteContent["offices"],
    ctaBands: row.ctaBands as unknown as SiteContent["ctaBands"],
    nav: row.nav as unknown as SiteContent["nav"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Only the groups present in the payload are written. Returns a plain JSON
 * map so it can be spread into either a create or an update input — Prisma's
 * update type additionally permits field-operation objects, which would not
 * be assignable to the create type.
 */
function toJsonGroups(data: SiteContentUpdateInput): Record<string, Prisma.InputJsonValue> {
  const out: Record<string, Prisma.InputJsonValue> = {};
  for (const key of Object.keys(data) as (keyof SiteContentUpdateInput)[]) {
    const value = data[key];
    if (value !== undefined) out[key] = json(value);
  }
  return out;
}

class SiteContentRepository {
  async get(): Promise<SiteContent> {
    // Upsert guarantees the singleton exists without a race.
    const row = await run("Site content", () =>
      prisma.siteContent.upsert({
        where: { id: SINGLETON_ID },
        update: {},
        create: CREATE_DEFAULTS,
      }),
    );
    return toDto(row);
  }

  async update(data: SiteContentUpdateInput): Promise<SiteContent> {
    const groups = toJsonGroups(data);
    const row = await run("Site content", () =>
      prisma.siteContent.upsert({
        where: { id: SINGLETON_ID },
        update: groups,
        create: { ...CREATE_DEFAULTS, ...groups },
      }),
    );
    return toDto(row);
  }
}

export const siteContentRepository = new SiteContentRepository();
