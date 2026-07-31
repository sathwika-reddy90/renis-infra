import { Prisma, type Property as PropertyRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { PrismaRepository } from "./prisma.repository";
import { run } from "../utils/prismaError";
import { toPageArgs, type PageArgs, type PaginationParams } from "../utils/pagination";
import type { Property, PropertyCreateInput, PropertyUpdateInput } from "../types/property";
import type { PropertyStatus, PropertyType } from "../types/enums";

export interface PropertyFilter extends PaginationParams {
  status?: PropertyStatus;
  propertyType?: PropertyType;
  city?: string;
  /** Substring match against the free-text address line. */
  location?: string;
  search?: string;
  featured?: boolean;
  sort?: "curated" | "newest" | "priceAsc" | "priceDesc";
}

export interface PropertySearchResult {
  items: Property[];
  total: number;
  page: number;
  limit: number;
}

/** Distinct values present in the data, for building filter controls. */
export interface PropertyFacets {
  statuses: PropertyStatus[];
  propertyTypes: PropertyType[];
  cities: string[];
  locations: string[];
}

const json = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

// Street-level noise to strip when deriving neighbourhood filter options from
// a free-text address (e.g. "Plot No. 1, Kokapet, Hyderabad" → "Kokapet").
const STREET_NOISE = /\b(road|rd|street|st|plot|no\.?|survey|lane|block|phase|opp|near)\b/i;

/** Neighbourhood labels usable as filter options, derived from the address. */
function areaLabels(location: string, city: string): string[] {
  return location
    .split(",")
    .map((part) => part.trim())
    .filter(
      (part) =>
        part.length > 2 &&
        !/\d/.test(part) &&
        !STREET_NOISE.test(part) &&
        part.toLowerCase() !== city.toLowerCase(),
    );
}

function toCreateData(input: PropertyCreateInput): Prisma.PropertyCreateInput {
  return {
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    location: input.location,
    city: input.city,
    state: input.state,
    price: input.price,
    priceLabel: input.priceLabel,
    propertyType: input.propertyType,
    status: input.status,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    area: input.area,
    possession: input.possession,
    reraNumber: input.reraNumber,
    developer: input.developer,
    developerLogo: input.developerLogo,
    featuredImage: input.featuredImage,
    heroImages: input.heroImages,
    video: input.video,
    virtualTour: input.virtualTour,
    brochure: input.brochure,
    masterPlan: input.masterPlan,
    masterLegend: input.masterLegend,
    certifications: input.certifications,
    featured: input.featured,
    order: input.order,
    gallery: input.gallery,
    amenities: input.amenities,
    floorPlans: json(input.floorPlans),
    specifications: json(input.specifications),
    paymentPlans: json(input.paymentPlans),
    nearbyLandmarks: json(input.nearbyLandmarks),
    overviewStats: json(input.overviewStats),
    highlights: json(input.highlights),
    seo: json(input.seo),
    lat: input.lat,
    lng: input.lng,
  };
}

function toUpdateData(input: PropertyUpdateInput): Prisma.PropertyUpdateInput {
  return {
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    location: input.location,
    city: input.city,
    state: input.state,
    price: input.price,
    priceLabel: input.priceLabel,
    propertyType: input.propertyType,
    status: input.status,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    area: input.area,
    possession: input.possession,
    reraNumber: input.reraNumber,
    developer: input.developer,
    developerLogo: input.developerLogo,
    featuredImage: input.featuredImage,
    heroImages: input.heroImages,
    video: input.video,
    virtualTour: input.virtualTour,
    brochure: input.brochure,
    masterPlan: input.masterPlan,
    masterLegend: input.masterLegend,
    certifications: input.certifications,
    featured: input.featured,
    order: input.order,
    gallery: input.gallery,
    amenities: input.amenities,
    floorPlans: input.floorPlans === undefined ? undefined : json(input.floorPlans),
    specifications: input.specifications === undefined ? undefined : json(input.specifications),
    paymentPlans: input.paymentPlans === undefined ? undefined : json(input.paymentPlans),
    nearbyLandmarks: input.nearbyLandmarks === undefined ? undefined : json(input.nearbyLandmarks),
    overviewStats: input.overviewStats === undefined ? undefined : json(input.overviewStats),
    highlights: input.highlights === undefined ? undefined : json(input.highlights),
    seo: input.seo === undefined ? undefined : json(input.seo),
    lat: input.lat,
    lng: input.lng,
  };
}

class PropertyRepository extends PrismaRepository<
  PropertyRow,
  Property,
  PropertyCreateInput,
  PropertyUpdateInput
> {
  protected readonly resource = "Property";

  protected toDto(row: PropertyRow): Property {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      location: row.location,
      city: row.city,
      state: row.state,
      price: row.price,
      priceLabel: row.priceLabel,
      propertyType: row.propertyType,
      status: row.status,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      area: row.area,
      possession: row.possession,
      reraNumber: row.reraNumber,
      developer: row.developer,
      developerLogo: row.developerLogo ?? undefined,
      featuredImage: row.featuredImage,
      heroImages: row.heroImages,
      video: row.video ?? undefined,
      virtualTour: row.virtualTour ?? undefined,
      brochure: row.brochure ?? undefined,
      masterPlan: row.masterPlan,
      masterLegend: row.masterLegend,
      certifications: row.certifications,
      featured: row.featured,
      order: row.order,
      gallery: row.gallery,
      amenities: row.amenities,
      floorPlans: row.floorPlans as unknown as Property["floorPlans"],
      specifications: row.specifications as unknown as Property["specifications"],
      paymentPlans: row.paymentPlans as unknown as Property["paymentPlans"],
      nearbyLandmarks: row.nearbyLandmarks as unknown as Property["nearbyLandmarks"],
      overviewStats: row.overviewStats as unknown as Property["overviewStats"],
      // Rows written before this column existed default to [], so the cast
      // is safe without a backfill.
      highlights: (row.highlights ?? []) as unknown as Property["highlights"],
      lat: row.lat ?? undefined,
      lng: row.lng ?? undefined,
      seo: row.seo as unknown as Property["seo"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  protected queryMany(args: PageArgs): Promise<PropertyRow[]> {
    return prisma.property.findMany({
      // Editors control sequence via `order`; ties fall back to newest-first.
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: args.skip,
      take: args.take,
    });
  }

  // GET /:id resolves either a cuid or a slug — no route change required.
  protected queryOne(id: string): Promise<PropertyRow | null> {
    return prisma.property.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  }

  protected insert(data: PropertyCreateInput): Promise<PropertyRow> {
    return prisma.property.create({ data: toCreateData(data) });
  }

  protected change(id: string, data: PropertyUpdateInput): Promise<PropertyRow> {
    return prisma.property.update({ where: { id }, data: toUpdateData(data) });
  }

  protected async remove(id: string): Promise<void> {
    await prisma.property.delete({ where: { id } });
  }

  /** Dedicated slug lookup (unique index). */
  async findBySlug(slug: string): Promise<Property | null> {
    const row = await run(this.resource, () => prisma.property.findUnique({ where: { slug } }));
    return row ? this.toDto(row) : null;
  }

  /** Filtered + sorted + paginated search, returning a true total count. */
  async search(filter: PropertyFilter = {}): Promise<PropertySearchResult> {
    const where: Prisma.PropertyWhereInput = {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.propertyType ? { propertyType: filter.propertyType } : {}),
      ...(filter.city ? { city: { equals: filter.city, mode: "insensitive" } } : {}),
      ...(filter.location
        ? { location: { contains: filter.location, mode: "insensitive" } }
        : {}),
      ...(filter.featured !== undefined ? { featured: filter.featured } : {}),
      ...(filter.search
        ? {
            OR: [
              { title: { contains: filter.search, mode: "insensitive" } },
              { location: { contains: filter.search, mode: "insensitive" } },
              { city: { contains: filter.search, mode: "insensitive" } },
              { developer: { contains: filter.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.PropertyOrderByWithRelationInput[] =
      filter.sort === "priceAsc"
        ? [{ price: "asc" }]
        : filter.sort === "priceDesc"
          ? [{ price: "desc" }]
          : filter.sort === "newest"
            ? [{ createdAt: "desc" }]
            : [{ order: "asc" }, { createdAt: "desc" }];

    const { skip, take } = toPageArgs(filter);
    // Count and page are read in one round trip so `total` always matches the
    // filter the page was drawn from.
    const [rows, total] = await run(this.resource, () =>
      prisma.$transaction([
        prisma.property.findMany({ where, orderBy, skip, take }),
        prisma.property.count({ where }),
      ]),
    );

    return {
      items: rows.map((row) => this.toDto(row)),
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
    };
  }

  /**
   * Distinct values actually present in the data, so filter controls can be
   * built from the catalogue instead of a hardcoded list that silently hides
   * projects in any other city.
   */
  async facets(): Promise<PropertyFacets> {
    const rows = await run(this.resource, () =>
      prisma.property.findMany({
        select: { status: true, propertyType: true, city: true, location: true },
      }),
    );

    const uniq = <T>(values: T[]): T[] => [...new Set(values)];

    return {
      statuses: uniq(rows.map((r) => r.status)) as PropertyStatus[],
      propertyTypes: uniq(rows.map((r) => r.propertyType)) as PropertyType[],
      cities: uniq(rows.map((r) => r.city).filter(Boolean)).sort(),
      locations: uniq(rows.flatMap((r) => areaLabels(r.location, r.city))).sort(),
    };
  }

  /** Other projects to surface on a detail page, excluding the current one. */
  async related(slug: string, limit = 3): Promise<Property[]> {
    const current = await run(this.resource, () =>
      prisma.property.findUnique({ where: { slug }, select: { id: true, city: true } }),
    );
    if (!current) return [];

    // Prefer the same city, then top up with anything else.
    const sameCity = await run(this.resource, () =>
      prisma.property.findMany({
        where: { id: { not: current.id }, city: current.city },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: limit,
      }),
    );

    if (sameCity.length >= limit) return sameCity.map((row) => this.toDto(row));

    const fill = await run(this.resource, () =>
      prisma.property.findMany({
        where: { id: { notIn: [current.id, ...sameCity.map((r) => r.id)] } },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: limit - sameCity.length,
      }),
    );

    return [...sameCity, ...fill].map((row) => this.toDto(row));
  }
}

export const propertyRepository = new PropertyRepository();
