import { Prisma, type Media as MediaRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { run, runNullable } from "../utils/prismaError";
import type { Media, MediaListQuery, MediaListResult } from "../types/media";

function toDto(row: MediaRow): Media {
  return {
    id: row.id,
    provider: row.provider,
    url: row.url,
    thumbnailUrl: row.thumbnailUrl,
    fileName: row.fileName,
    mimeType: row.mimeType,
    type: row.type,
    size: row.size,
    width: row.width,
    height: row.height,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export interface MediaInsert {
  provider: string;
  key: string;
  url: string;
  thumbnailUrl: string | null;
  fileName: string;
  mimeType: string;
  type: Media["type"];
  size: number;
  width: number | null;
  height: number | null;
}

class MediaRepository {
  async list(query: MediaListQuery): Promise<MediaListResult> {
    const where: Prisma.MediaWhereInput = {
      ...(query.search ? { fileName: { contains: query.search, mode: "insensitive" } } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    const [rows, total] = await run("Media", () =>
      Promise.all([
        prisma.media.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        prisma.media.count({ where }),
      ]),
    );

    return { items: rows.map(toDto), total, page: query.page, limit: query.limit };
  }

  async findById(id: string): Promise<Media | null> {
    const row = await run("Media", () => prisma.media.findUnique({ where: { id } }));
    return row ? toDto(row) : null;
  }

  /** Returns the storage key for a media row without exposing it in the DTO. */
  async keyOf(id: string): Promise<string | null> {
    const row = await run("Media", () =>
      prisma.media.findUnique({ where: { id }, select: { key: true } }),
    );
    return row?.key ?? null;
  }

  async create(data: MediaInsert): Promise<Media> {
    const row = await run("Media", () => prisma.media.create({ data }));
    return toDto(row);
  }

  async rename(id: string, fileName: string): Promise<Media | null> {
    const row = await runNullable("Media", () =>
      prisma.media.update({ where: { id }, data: { fileName } }),
    );
    return row ? toDto(row) : null;
  }

  async replace(
    id: string,
    data: Pick<MediaInsert, "key" | "url" | "thumbnailUrl" | "mimeType" | "type" | "size" | "width" | "height">,
  ): Promise<Media | null> {
    const row = await runNullable("Media", () => prisma.media.update({ where: { id }, data }));
    return row ? toDto(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const done = await runNullable("Media", async () => {
      await prisma.media.delete({ where: { id } });
      return true;
    });
    return done === true;
  }
}

export const mediaRepository = new MediaRepository();
