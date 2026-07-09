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
  search?: string;
  sort?: "newest" | "priceAsc" | "priceDesc";
}

const json = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

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
    featuredImage: input.featuredImage,
    video: input.video,
    virtualTour: input.virtualTour,
    brochure: input.brochure,
    masterPlan: input.masterPlan,
    masterLegend: input.masterLegend,
    gallery: input.gallery,
    amenities: input.amenities,
    floorPlans: json(input.floorPlans),
    specifications: json(input.specifications),
    paymentPlans: json(input.paymentPlans),
    nearbyLandmarks: json(input.nearbyLandmarks),
    overviewStats: json(input.overviewStats),
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
    featuredImage: input.featuredImage,
    video: input.video,
    virtualTour: input.virtualTour,
    brochure: input.brochure,
    masterPlan: input.masterPlan,
    masterLegend: input.masterLegend,
    gallery: input.gallery,
    amenities: input.amenities,
    floorPlans: input.floorPlans === undefined ? undefined : json(input.floorPlans),
    specifications: input.specifications === undefined ? undefined : json(input.specifications),
    paymentPlans: input.paymentPlans === undefined ? undefined : json(input.paymentPlans),
    nearbyLandmarks: input.nearbyLandmarks === undefined ? undefined : json(input.nearbyLandmarks),
    overviewStats: input.overviewStats === undefined ? undefined : json(input.overviewStats),
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
      featuredImage: row.featuredImage,
      video: row.video ?? undefined,
      virtualTour: row.virtualTour ?? undefined,
      brochure: row.brochure ?? undefined,
      masterPlan: row.masterPlan,
      masterLegend: row.masterLegend,
      gallery: row.gallery,
      amenities: row.amenities,
      floorPlans: row.floorPlans as unknown as Property["floorPlans"],
      specifications: row.specifications as unknown as Property["specifications"],
      paymentPlans: row.paymentPlans as unknown as Property["paymentPlans"],
      nearbyLandmarks: row.nearbyLandmarks as unknown as Property["nearbyLandmarks"],
      overviewStats: row.overviewStats as unknown as Property["overviewStats"],
      lat: row.lat ?? undefined,
      lng: row.lng ?? undefined,
      seo: row.seo as unknown as Property["seo"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  protected queryMany(args: PageArgs): Promise<PropertyRow[]> {
    return prisma.property.findMany({ orderBy: { createdAt: "desc" }, skip: args.skip, take: args.take });
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

  /** Filtered + sorted + paginated search capability. */
  async search(filter: PropertyFilter = {}): Promise<Property[]> {
    const where: Prisma.PropertyWhereInput = {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.propertyType ? { propertyType: filter.propertyType } : {}),
      ...(filter.city ? { city: filter.city } : {}),
      ...(filter.search
        ? {
            OR: [
              { title: { contains: filter.search, mode: "insensitive" } },
              { location: { contains: filter.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const orderBy: Prisma.PropertyOrderByWithRelationInput =
      filter.sort === "priceAsc"
        ? { price: "asc" }
        : filter.sort === "priceDesc"
          ? { price: "desc" }
          : { createdAt: "desc" };

    const { skip, take } = toPageArgs(filter);
    const rows = await run(this.resource, () =>
      prisma.property.findMany({ where, orderBy, skip, take }),
    );
    return rows.map((row) => this.toDto(row));
  }
}

export const propertyRepository = new PropertyRepository();
