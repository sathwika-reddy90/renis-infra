import { Prisma, type GalleryImage as GalleryRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { PrismaRepository } from "./prisma.repository";
import { opt } from "../utils/optional";
import type { PageArgs } from "../utils/pagination";
import type { GalleryImage, GalleryCreateInput, GalleryUpdateInput } from "../types/gallery";

class GalleryRepository extends PrismaRepository<
  GalleryRow,
  GalleryImage,
  GalleryCreateInput,
  GalleryUpdateInput
> {
  protected readonly resource = "Gallery image";

  protected toDto(row: GalleryRow): GalleryImage {
    return {
      id: row.id,
      src: row.src,
      alt: row.alt,
      category: row.category,
      order: row.order,
      propertyId: opt(row.propertyId),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  protected queryMany(args: PageArgs): Promise<GalleryRow[]> {
    return prisma.galleryImage.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip: args.skip,
      take: args.take,
    });
  }

  protected queryOne(id: string): Promise<GalleryRow | null> {
    return prisma.galleryImage.findUnique({ where: { id } });
  }

  protected insert(data: GalleryCreateInput): Promise<GalleryRow> {
    const create: Prisma.GalleryImageUncheckedCreateInput = {
      src: data.src,
      alt: data.alt,
      category: data.category,
      order: data.order,
      propertyId: data.propertyId ?? undefined,
    };
    return prisma.galleryImage.create({ data: create });
  }

  protected change(id: string, data: GalleryUpdateInput): Promise<GalleryRow> {
    const update: Prisma.GalleryImageUncheckedUpdateInput = {
      src: data.src,
      alt: data.alt,
      category: data.category,
      order: data.order,
      propertyId: data.propertyId ?? undefined,
    };
    return prisma.galleryImage.update({ where: { id }, data: update });
  }

  protected async remove(id: string): Promise<void> {
    await prisma.galleryImage.delete({ where: { id } });
  }
}

export const galleryRepository = new GalleryRepository();
