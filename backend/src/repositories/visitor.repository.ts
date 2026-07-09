import { Prisma, type Visitor as VisitorRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { run } from "../utils/prismaError";
import { toPageArgs, type PaginationParams } from "../utils/pagination";
import { opt } from "../utils/optional";
import type { Visitor, VisitorCreateInput } from "../types/visitor";

// Analytics model: append-only (no route wired yet).
function toDto(row: VisitorRow): Visitor {
  return {
    id: row.id,
    ip: opt(row.ip),
    userAgent: opt(row.userAgent),
    path: row.path,
    referrer: opt(row.referrer),
    createdAt: row.createdAt,
  };
}

class VisitorRepository {
  async create(data: VisitorCreateInput): Promise<Visitor> {
    const create: Prisma.VisitorCreateInput = {
      ip: data.ip,
      userAgent: data.userAgent,
      path: data.path,
      referrer: data.referrer,
    };
    const row = await run("Visitor", () => prisma.visitor.create({ data: create }));
    return toDto(row);
  }

  async findAll(params?: PaginationParams): Promise<Visitor[]> {
    const { skip, take } = toPageArgs(params);
    const rows = await run("Visitor", () =>
      prisma.visitor.findMany({ orderBy: { createdAt: "desc" }, skip, take }),
    );
    return rows.map(toDto);
  }
}

export const visitorRepository = new VisitorRepository();
