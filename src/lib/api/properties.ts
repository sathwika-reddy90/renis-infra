import { apiClient, type Paged } from "./client";
import { type ApiProperty, toProject, toProperty } from "./dto";
import type { Project } from "@/types/project";
import type { Property, PropertyStatus, PropertyType } from "@/types/property";

/* --------------------------------- queries --------------------------------- */

export interface ProjectQuery {
  page?: number;
  limit?: number;
  status?: PropertyStatus;
  propertyType?: PropertyType;
  city?: string;
  location?: string;
  search?: string;
  featured?: boolean;
  sort?: "curated" | "newest" | "priceAsc" | "priceDesc";
}

/** Display labels → the raw enum values the API expects. */
const STATUS_PARAM: Record<PropertyStatus, string> = {
  "New Launch": "NEW_LAUNCH",
  "Now Selling": "NOW_SELLING",
  "Ready to Move": "READY_TO_MOVE",
  "Coming Soon": "COMING_SOON",
  "Sold Out": "SOLD_OUT",
};

const TYPE_PARAM: Record<PropertyType, string> = {
  Apartments: "APARTMENTS",
  Villas: "VILLAS",
  Penthouses: "PENTHOUSES",
  Plots: "PLOTS",
};

function toSearchParams(query: ProjectQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.status) params.set("status", STATUS_PARAM[query.status]);
  if (query.propertyType) params.set("propertyType", TYPE_PARAM[query.propertyType]);
  if (query.city) params.set("city", query.city);
  if (query.location) params.set("location", query.location);
  if (query.search) params.set("search", query.search);
  if (query.featured !== undefined) params.set("featured", String(query.featured));
  if (query.sort) params.set("sort", query.sort);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/* --------------------------------- fetchers -------------------------------- */

/** Paginated, filtered listing for the projects explorer. */
export async function fetchProjectPage(
  query: ProjectQuery = {},
  signal?: AbortSignal,
): Promise<Paged<Project>> {
  const page = await apiClient.getPaged<ApiProperty>(`/properties${toSearchParams(query)}`, signal);
  return { ...page, items: page.items.map(toProject) };
}

/** Unpaginated helper for rails (nav mega-menu, footer, homepage showcase). */
export async function fetchProjects(signal?: AbortSignal): Promise<Project[]> {
  const page = await apiClient.getPaged<ApiProperty>("/properties?limit=60", signal);
  return page.items.map(toProject);
}

export async function fetchProperties(signal?: AbortSignal): Promise<Property[]> {
  const page = await apiClient.getPaged<ApiProperty>("/properties?limit=60", signal);
  return page.items.map(toProperty);
}

/**
 * Single project. The backend resolves `:id` as either a cuid or a slug, so
 * this is one request — it used to download the entire property list and
 * find() through it.
 */
export async function fetchPropertyBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<Property | null> {
  try {
    const data = await apiClient.get<ApiProperty>(
      `/properties/${encodeURIComponent(slug)}`,
      signal,
    );
    return toProperty(data);
  } catch {
    // 404 for an unknown slug is an expected outcome, not an error state.
    return null;
  }
}

export async function fetchRelatedProjects(
  slug: string,
  limit = 3,
  signal?: AbortSignal,
): Promise<Project[]> {
  const page = await apiClient.getPaged<ApiProperty>(
    `/properties/${encodeURIComponent(slug)}/related?limit=${limit}`,
    signal,
  );
  return page.items.map(toProject);
}

/* ---------------------------------- facets --------------------------------- */

export interface ProjectFacets {
  statuses: PropertyStatus[];
  propertyTypes: PropertyType[];
  cities: string[];
  locations: string[];
}

interface ApiFacets {
  statuses: (keyof typeof STATUS_LABEL)[];
  propertyTypes: (keyof typeof TYPE_LABEL)[];
  cities: string[];
  locations: string[];
}

const STATUS_LABEL = {
  NEW_LAUNCH: "New Launch",
  NOW_SELLING: "Now Selling",
  READY_TO_MOVE: "Ready to Move",
  COMING_SOON: "Coming Soon",
  SOLD_OUT: "Sold Out",
} as const;

const TYPE_LABEL = {
  APARTMENTS: "Apartments",
  VILLAS: "Villas",
  PENTHOUSES: "Penthouses",
  PLOTS: "Plots",
} as const;

/**
 * Filter options derived from the live catalogue, so a project in a city the
 * old static list didn't know about is still reachable.
 */
export async function fetchProjectFacets(signal?: AbortSignal): Promise<ProjectFacets> {
  const data = await apiClient.get<ApiFacets>("/properties/facets", signal);
  return {
    statuses: data.statuses.map((s) => STATUS_LABEL[s]).filter(Boolean),
    propertyTypes: data.propertyTypes.map((t) => TYPE_LABEL[t]).filter(Boolean),
    cities: data.cities,
    locations: data.locations,
  };
}
