import { Prisma, type Testimonial as TestimonialRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { PrismaRepository } from "./prisma.repository";
import { opt } from "../utils/optional";
import type { PageArgs } from "../utils/pagination";
import type {
  Testimonial,
  TestimonialCreateInput,
  TestimonialUpdateInput,
} from "../types/testimonial";

class TestimonialRepository extends PrismaRepository<
  TestimonialRow,
  Testimonial,
  TestimonialCreateInput,
  TestimonialUpdateInput
> {
  protected readonly resource = "Testimonial";

  protected toDto(row: TestimonialRow): Testimonial {
    return {
      id: row.id,
      quote: row.quote,
      name: row.name,
      role: row.role,
      project: opt(row.project),
      rating: opt(row.rating),
      avatar: opt(row.avatar),
      featured: row.featured,
      propertyId: opt(row.propertyId),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  protected queryMany(args: PageArgs): Promise<TestimonialRow[]> {
    return prisma.testimonial.findMany({
      orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
      skip: args.skip,
      take: args.take,
    });
  }

  protected queryOne(id: string): Promise<TestimonialRow | null> {
    return prisma.testimonial.findUnique({ where: { id } });
  }

  protected insert(data: TestimonialCreateInput): Promise<TestimonialRow> {
    const create: Prisma.TestimonialUncheckedCreateInput = {
      quote: data.quote,
      name: data.name,
      role: data.role,
      project: data.project,
      rating: data.rating,
      avatar: data.avatar,
      featured: data.featured,
      propertyId: data.propertyId ?? undefined,
    };
    return prisma.testimonial.create({ data: create });
  }

  protected change(id: string, data: TestimonialUpdateInput): Promise<TestimonialRow> {
    const update: Prisma.TestimonialUncheckedUpdateInput = {
      quote: data.quote,
      name: data.name,
      role: data.role,
      project: data.project,
      rating: data.rating,
      avatar: data.avatar,
      featured: data.featured,
      propertyId: data.propertyId ?? undefined,
    };
    return prisma.testimonial.update({ where: { id }, data: update });
  }

  protected async remove(id: string): Promise<void> {
    await prisma.testimonial.delete({ where: { id } });
  }
}

export const testimonialRepository = new TestimonialRepository();
