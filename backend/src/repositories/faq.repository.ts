import { Prisma, type FAQ as FaqRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { PrismaRepository } from "./prisma.repository";
import { opt } from "../utils/optional";
import type { PageArgs } from "../utils/pagination";
import type { FAQ, FaqCreateInput, FaqUpdateInput } from "../types/faq";

class FaqRepository extends PrismaRepository<FaqRow, FAQ, FaqCreateInput, FaqUpdateInput> {
  protected readonly resource = "FAQ";

  protected toDto(row: FaqRow): FAQ {
    return {
      id: row.id,
      question: row.question,
      answer: row.answer,
      category: row.category,
      order: row.order,
      propertyId: opt(row.propertyId),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  protected queryMany(args: PageArgs): Promise<FaqRow[]> {
    return prisma.fAQ.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip: args.skip,
      take: args.take,
    });
  }

  protected queryOne(id: string): Promise<FaqRow | null> {
    return prisma.fAQ.findUnique({ where: { id } });
  }

  protected insert(data: FaqCreateInput): Promise<FaqRow> {
    const create: Prisma.FAQUncheckedCreateInput = {
      question: data.question,
      answer: data.answer,
      category: data.category,
      order: data.order,
      propertyId: data.propertyId ?? undefined,
    };
    return prisma.fAQ.create({ data: create });
  }

  protected change(id: string, data: FaqUpdateInput): Promise<FaqRow> {
    const update: Prisma.FAQUncheckedUpdateInput = {
      question: data.question,
      answer: data.answer,
      category: data.category,
      order: data.order,
      propertyId: data.propertyId ?? undefined,
    };
    return prisma.fAQ.update({ where: { id }, data: update });
  }

  protected async remove(id: string): Promise<void> {
    await prisma.fAQ.delete({ where: { id } });
  }
}

export const faqRepository = new FaqRepository();
