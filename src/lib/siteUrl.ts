/**
 * Canonical public origin, used for sitemaps, robots and absolute OG URLs.
 *
 * Set NEXT_PUBLIC_SITE_URL in production. The localhost default keeps dev
 * working without extra configuration.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/** Builds an absolute URL from a root-relative path. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
