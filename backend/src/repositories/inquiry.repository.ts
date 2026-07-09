import { Prisma, type Inquiry as InquiryRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { PrismaRepository } from "./prisma.repository";
import { run } from "../utils/prismaError";
import { opt } from "../utils/optional";
import type { PageArgs } from "../utils/pagination";
import type {
  Inquiry,
  InquiryCreateInput,
  InquiryStatusHistoryEntry,
  InquiryUpdateInput,
} from "../types/inquiry";

class InquiryRepository extends PrismaRepository<
  InquiryRow,
  Inquiry,
  InquiryCreateInput,
  InquiryUpdateInput
> {
  protected readonly resource = "Inquiry";

  protected toDto(row: InquiryRow): Inquiry {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: opt(row.message),
      interest: opt(row.interest),
      status: row.status,
      propertyId: opt(row.propertyId),
      assignedToId: opt(row.assignedToId),
      followUpDate: opt(row.followUpDate ?? undefined),
      notes: opt(row.notes),
      visitDate: opt(row.visitDate ?? undefined),
      visitTime: opt(row.visitTime),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  protected queryMany(args: PageArgs): Promise<InquiryRow[]> {
    return prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, skip: args.skip, take: args.take });
  }

  protected queryOne(id: string): Promise<InquiryRow | null> {
    return prisma.inquiry.findUnique({ where: { id } });
  }

  protected insert(data: InquiryCreateInput): Promise<InquiryRow> {
    const create: Prisma.InquiryUncheckedCreateInput = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      interest: data.interest,
      status: data.status,
      propertyId: data.propertyId ?? undefined,
      visitDate: data.visitDate,
      visitTime: data.visitTime,
    };
    return run(this.resource, async () => {
      const row = await prisma.inquiry.create({ data: create });
      // Seed the timeline so every lead has a starting entry.
      await prisma.inquiryStatusHistory.create({
        data: { inquiryId: row.id, fromStatus: null, toStatus: row.status },
      });
      return row;
    });
  }

  protected change(id: string, data: InquiryUpdateInput): Promise<InquiryRow> {
    const update: Prisma.InquiryUncheckedUpdateInput = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      interest: data.interest,
      status: data.status,
      propertyId: data.propertyId === null ? null : (data.propertyId ?? undefined),
      assignedToId: data.assignedToId === null ? null : (data.assignedToId ?? undefined),
      followUpDate: data.followUpDate === null ? null : (data.followUpDate ?? undefined),
      notes: data.notes === null ? null : (data.notes ?? undefined),
      visitDate: data.visitDate === null ? null : (data.visitDate ?? undefined),
      visitTime: data.visitTime === null ? null : (data.visitTime ?? undefined),
    };
    return prisma.inquiry.update({ where: { id }, data: update });
  }

  protected async remove(id: string): Promise<void> {
    await prisma.inquiry.delete({ where: { id } });
  }

  /** Updates a lead and, if `status` actually changes, appends a timeline entry. */
  async updateWithHistory(
    id: string,
    data: InquiryUpdateInput,
    changedById: string | null,
  ): Promise<Inquiry | null> {
    return run(this.resource, async () => {
      const before = await prisma.inquiry.findUnique({ where: { id } });
      if (!before) return null;

      const row = await this.change(id, data);

      if (data.status && data.status !== before.status) {
        await prisma.inquiryStatusHistory.create({
          data: { inquiryId: id, fromStatus: before.status, toStatus: data.status, changedById },
        });
      }

      return this.toDto(row);
    });
  }

  async history(inquiryId: string): Promise<InquiryStatusHistoryEntry[]> {
    const rows = await run(this.resource, () =>
      prisma.inquiryStatusHistory.findMany({
        where: { inquiryId },
        orderBy: { createdAt: "asc" },
      }),
    );
    return rows.map((row) => ({
      id: row.id,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      changedById: row.changedById,
      createdAt: row.createdAt,
    }));
  }
}

export const inquiryRepository = new InquiryRepository();
