import { Prisma, type Amenity as AmenityRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { PrismaRepository } from "./prisma.repository";
import { opt } from "../utils/optional";
import type { PageArgs } from "../utils/pagination";
import type { Amenity, AmenityCreateInput, AmenityUpdateInput } from "../types/amenity";

class AmenityRepository extends PrismaRepository<
  AmenityRow,
  Amenity,
  AmenityCreateInput,
  AmenityUpdateInput
> {
  protected readonly resource = "Amenity";

  protected toDto(row: AmenityRow): Amenity {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.icon,
      category: opt(row.category),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  protected queryMany(args: PageArgs): Promise<AmenityRow[]> {
    return prisma.amenity.findMany({ orderBy: { createdAt: "asc" }, skip: args.skip, take: args.take });
  }

  protected queryOne(id: string): Promise<AmenityRow | null> {
    return prisma.amenity.findUnique({ where: { id } });
  }

  protected insert(data: AmenityCreateInput): Promise<AmenityRow> {
    const create: Prisma.AmenityCreateInput = {
      title: data.title,
      description: data.description,
      icon: data.icon,
      category: data.category,
    };
    return prisma.amenity.create({ data: create });
  }

  protected change(id: string, data: AmenityUpdateInput): Promise<AmenityRow> {
    const update: Prisma.AmenityUpdateInput = {
      title: data.title,
      description: data.description,
      icon: data.icon,
      category: data.category,
    };
    return prisma.amenity.update({ where: { id }, data: update });
  }

  protected async remove(id: string): Promise<void> {
    await prisma.amenity.delete({ where: { id } });
  }
}

export const amenityRepository = new AmenityRepository();
