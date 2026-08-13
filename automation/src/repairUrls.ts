import type { BrowserContext } from "playwright";
import { assetOrigin, config } from "./config";
import type { Logger } from "./logger";

/**
 * Rewrites stored media references from absolute backend URLs to root-relative
 * paths.
 *
 * Why this is needed: the backend runs `helmet()`, which sets
 * `Cross-Origin-Resource-Policy: same-origin` on everything it serves,
 * `/uploads/**` included. An `<img src="http://localhost:4000/uploads/x.jpg">`
 * inside a page served from :3000 therefore gets a 200 that the browser then
 * throws away — the element ends up `complete === true` with
 * `naturalWidth === 0`, i.e. a blank preview and no failed network response to
 * point at.
 *
 * The public site never showed this because `src/lib/api/dto.ts` strips the
 * backend origin before rendering. The admin CMS renders `item.url` verbatim,
 * so every image inserted through the Media Library (which returns absolute
 * URLs) previews blank.
 *
 * Storing `/uploads/...` fixes both: Next serves it same-origin via the
 * `/uploads/:path*` rewrite in `next.config.ts`, which is exactly the shape the
 * seeded records already use.
 */

const MEDIA_KEYS = ["featuredImage", "masterPlan", "developerLogo"] as const;
const LIST_KEYS = ["heroImages", "gallery"] as const;

interface Property {
  id: string;
  slug: string;
  featuredImage: string;
  masterPlan: string;
  developerLogo?: string | null;
  heroImages: string[];
  gallery: string[];
  floorPlans: { image: string; [k: string]: unknown }[];
  seo?: { ogImage?: string | null; [k: string]: unknown };
}

/** `http://host:4000/uploads/x.jpg` -> `/uploads/x.jpg`; anything else untouched. */
export function toRelative(url: string | null | undefined): string {
  if (!url) return "";
  return url.startsWith(assetOrigin) ? url.slice(assetOrigin.length) || "/" : url;
}

const needsFix = (url: string | null | undefined): boolean =>
  Boolean(url) && (url as string).startsWith(assetOrigin);

/** Exchanges the context's refresh cookie for a short-lived access token. */
async function accessToken(context: BrowserContext): Promise<string> {
  const res = await context.request.post(`${config.apiUrl}/auth/refresh`);
  const body = (await res.json()) as { data?: { accessToken?: string } };
  const token = body?.data?.accessToken;
  if (!token) throw new Error("Could not obtain an access token for the URL repair");
  return token;
}

export interface UrlRepairResult {
  slug: string;
  changed: number;
}

export async function repairAbsoluteMediaUrls(
  context: BrowserContext,
  log: Logger,
  slugs?: string[],
): Promise<UrlRepairResult[]> {
  const token = await accessToken(context);
  const auth = { Authorization: `Bearer ${token}` };

  const listRes = await context.request.get(`${config.apiUrl}/properties`, { headers: auth });
  const properties = ((await listRes.json()) as { data: Property[] }).data;

  const results: UrlRepairResult[] = [];

  for (const property of properties) {
    if (slugs && !slugs.includes(property.slug)) continue;

    const patch: Record<string, unknown> = {};
    let changed = 0;

    for (const key of MEDIA_KEYS) {
      const value = property[key];
      if (needsFix(value)) {
        patch[key] = toRelative(value);
        changed += 1;
      }
    }

    for (const key of LIST_KEYS) {
      const list = property[key] ?? [];
      if (list.some(needsFix)) {
        patch[key] = list.map(toRelative);
        changed += list.filter(needsFix).length;
      }
    }

    if ((property.floorPlans ?? []).some((f) => needsFix(f.image))) {
      changed += property.floorPlans.filter((f) => needsFix(f.image)).length;
      patch.floorPlans = property.floorPlans.map((f) => ({ ...f, image: toRelative(f.image) }));
    }

    // `seo.ogImage` is deliberately left alone. It is never rendered through an
    // <img> (it becomes an og:image meta tag), so CORP does not apply — and the
    // admin form validates it with a strict absolute-URL check, so relativising
    // it here would just be undone by the drawer's own repair on the next save.

    if (changed === 0) continue;

    const res = await context.request.patch(`${config.apiUrl}/properties/${property.id}`, {
      headers: { ...auth, "content-type": "application/json" },
      data: patch,
    });

    if (!res.ok()) {
      const body = await res.text().catch(() => "");
      log.error(`${property.slug}: PATCH failed (HTTP ${res.status()}) ${body.slice(0, 160)}`);
      continue;
    }

    log.ok(`${property.slug}: rewrote ${changed} absolute URL(s) to relative paths`);
    results.push({ slug: property.slug, changed });
  }

  if (results.length === 0) log.info("no absolute media URLs left to normalise");
  return results;
}
