import { randomUUID } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { mediaRepository, type MediaInsert } from "../repositories/media.repository";
import { storageProvider } from "../storage";
import { ALLOWED_MIME_TO_EXT, isThumbnailable, mediaTypeForMime } from "../types/mediaMime";
import type { Media, MediaListQuery, MediaListResult } from "../types/media";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export interface UploadFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const THUMBNAIL_WIDTH = 480;
const MAX_UPLOAD_BYTES = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;

function datedKey(ext: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${yyyy}/${mm}/${randomUUID()}.${ext}`;
}

function thumbnailKeyFor(key: string): string {
  const { dir, name } = path.parse(key);
  return path.posix.join(dir, `${name}-thumb.webp`);
}

/** Validates an incoming file against the allowed type/size policy. */
function assertUploadable(file: UploadFile): void {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw ApiError.badRequest(
      `File exceeds the ${env.MAX_UPLOAD_SIZE_MB}MB limit`,
    );
  }
  if (!(file.mimetype in ALLOWED_MIME_TO_EXT)) {
    throw ApiError.badRequest(`Unsupported file type: ${file.mimetype}`);
  }
}

interface StoredUpload {
  key: string;
  url: string;
  thumbnailUrl: string | null;
  type: NonNullable<ReturnType<typeof mediaTypeForMime>>;
  width: number | null;
  height: number | null;
}

class MediaService {
  list(query: MediaListQuery): Promise<MediaListResult> {
    return mediaRepository.list(query);
  }

  async get(id: string): Promise<Media> {
    const item = await mediaRepository.findById(id);
    if (!item) throw ApiError.notFound("Media not found");
    return item;
  }

  /** Validates, persists via the storage provider, and generates a thumbnail if applicable. */
  private async storeUpload(file: UploadFile): Promise<StoredUpload> {
    assertUploadable(file);

    const type = mediaTypeForMime(file.mimetype);
    if (!type) throw ApiError.badRequest(`Unsupported file type: ${file.mimetype}`);

    const ext = ALLOWED_MIME_TO_EXT[file.mimetype];
    const key = datedKey(ext);
    const stored = await storageProvider.save({ key, buffer: file.buffer, mimeType: file.mimetype });

    let thumbnailUrl: string | null = null;
    let width: number | null = null;
    let height: number | null = null;

    if (isThumbnailable(file.mimetype)) {
      try {
        const image = sharp(file.buffer);
        const metadata = await image.metadata();
        width = metadata.width ?? null;
        height = metadata.height ?? null;

        const thumbnailBuffer = await image
          .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        const thumb = await storageProvider.save({
          key: thumbnailKeyFor(key),
          buffer: thumbnailBuffer,
          mimeType: "image/webp",
        });
        thumbnailUrl = thumb.url;
      } catch {
        // Thumbnail generation is best-effort; the original file still uploaded fine.
        thumbnailUrl = null;
      }
    }

    return { key, url: stored.url, thumbnailUrl, type, width, height };
  }

  async upload(file: UploadFile): Promise<Media> {
    const stored = await this.storeUpload(file);
    const insert: MediaInsert = {
      provider: storageProvider.name,
      key: stored.key,
      url: stored.url,
      thumbnailUrl: stored.thumbnailUrl,
      fileName: file.originalname,
      mimeType: file.mimetype,
      type: stored.type,
      size: file.size,
      width: stored.width,
      height: stored.height,
    };
    return mediaRepository.create(insert);
  }

  async uploadMany(files: UploadFile[]): Promise<Media[]> {
    const results: Media[] = [];
    for (const file of files) {
      results.push(await this.upload(file));
    }
    return results;
  }

  async rename(id: string, fileName: string): Promise<Media> {
    const updated = await mediaRepository.rename(id, fileName);
    if (!updated) throw ApiError.notFound("Media not found");
    return updated;
  }

  async replace(id: string, file: UploadFile): Promise<Media> {
    const existingKey = await mediaRepository.keyOf(id);
    if (!existingKey) throw ApiError.notFound("Media not found");

    const stored = await this.storeUpload(file);
    const updated = await mediaRepository.replace(id, {
      key: stored.key,
      url: stored.url,
      thumbnailUrl: stored.thumbnailUrl,
      mimeType: file.mimetype,
      type: stored.type,
      size: file.size,
      width: stored.width,
      height: stored.height,
    });
    if (!updated) throw ApiError.notFound("Media not found");

    // Best-effort cleanup of the file being replaced.
    await storageProvider.delete(existingKey).catch(() => undefined);
    await storageProvider.delete(thumbnailKeyFor(existingKey)).catch(() => undefined);

    return updated;
  }

  async remove(id: string): Promise<void> {
    const key = await mediaRepository.keyOf(id);
    if (!key) throw ApiError.notFound("Media not found");
    const deleted = await mediaRepository.delete(id);
    if (!deleted) throw ApiError.notFound("Media not found");
    await storageProvider.delete(key).catch(() => undefined);
    await storageProvider.delete(thumbnailKeyFor(key)).catch(() => undefined);
  }
}

export const mediaService = new MediaService();
