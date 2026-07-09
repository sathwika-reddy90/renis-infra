import type { MediaTypeValue } from "./media";

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

const VIDEO_MIME_TO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const DOCUMENT_MIME_TO_EXT: Record<string, string> = {
  "application/pdf": "pdf",
};

export const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  ...IMAGE_MIME_TO_EXT,
  ...VIDEO_MIME_TO_EXT,
  ...DOCUMENT_MIME_TO_EXT,
};

export function mediaTypeForMime(mimeType: string): MediaTypeValue | null {
  if (mimeType in IMAGE_MIME_TO_EXT) return "IMAGE";
  if (mimeType in VIDEO_MIME_TO_EXT) return "VIDEO";
  if (mimeType in DOCUMENT_MIME_TO_EXT) return "DOCUMENT";
  return null;
}

export function isThumbnailable(mimeType: string): boolean {
  return mimeType in IMAGE_MIME_TO_EXT && mimeType !== "image/svg+xml";
}
