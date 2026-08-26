import { Prisma, type Offer as OfferRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { PrismaRepository } from "./prisma.repository";
import { opt } from "../utils/optional";
import type { PageArgs } from "../utils/pagination";
import { computeOfferStatus, type Offer, type OfferCreateInput, type OfferUpdateInput } from "../types/offer";

class OfferRepository extends PrismaRepository<OfferRow, Offer, OfferCreateInput, OfferUpdateInput> {
  protected readonly resource = "Offer";

  protected toDto(row: OfferRow): Offer {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      discount: row.discount,
      image: opt(row.image),
      startDate: opt(row.startDate),
      endDate: opt(row.endDate),
      ctaText: opt(row.ctaText),
      ctaLink: opt(row.ctaLink),
      priority: row.priority,
      enabled: row.enabled,
      status: computeOfferStatus(row.enabled, row.startDate, row.endDate),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  protected queryMany(args: PageArgs): Promise<OfferRow[]> {
    return prisma.offer.findMany({
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      skip: args.skip,
      take: args.take,
    });
  }

  protected queryOne(id: string): Promise<OfferRow | null> {
    return prisma.offer.findUnique({ where: { id } });
  }

  protected insert(data: OfferCreateInput): Promise<OfferRow> {
    const create: Prisma.OfferUncheckedCreateInput = {
      title: data.title,
      description: data.description,
      discount: data.discount,
      image: data.image ?? undefined,
      startDate: data.startDate ?? undefined,
      endDate: data.endDate ?? undefined,
      ctaText: data.ctaText ?? undefined,
      ctaLink: data.ctaLink ?? undefined,
      priority: data.priority,
      enabled: data.enabled,
    };
    return prisma.offer.create({ data: create });
  }

  protected change(id: string, data: OfferUpdateInput): Promise<OfferRow> {
    const update: Prisma.OfferUncheckedUpdateInput = {
      title: data.title,
      description: data.description,
      discount: data.discount,
      image: data.image,
      startDate: data.startDate,
      endDate: data.endDate,
      ctaText: data.ctaText,
      ctaLink: data.ctaLink,
      priority: data.priority,
      enabled: data.enabled,
    };
    return prisma.offer.update({ where: { id }, data: update });
  }

  protected async remove(id: string): Promise<void> {
    await prisma.offer.delete({ where: { id } });
  }
}

export const offerRepository = new OfferRepository();
