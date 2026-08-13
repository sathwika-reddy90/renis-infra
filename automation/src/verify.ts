import { chromium, type BrowserContext, type Page } from "playwright";
import { assetOrigin, config, slugForFolder } from "./config";
import { listProjectFolders, readProjectFiles } from "./files";
import { Logger, rootLogger } from "./logger";
import { PropertyDrawer } from "./propertyDrawer";
import { createSession } from "./session";

export const SLOTS = [
  "Featured Image",
  "Hero Images",
  "Gallery Images",
  "Floor Plans",
  "Master Plan",
  "Developer Logo",
] as const;
export type SlotName = (typeof SLOTS)[number];

export interface SlotState {
  present: boolean;
  count: number;
  /** True when the folder holds a file for this slot but the CMS does not. */
  fixable: boolean;
  /** True when neither the CMS nor the source website has anything for it. */
  unavailable: boolean;
}

export interface PageCheck {
  ok: boolean;
  imageCount: number;
  broken: string[];
  reason?: string;
}

export interface ProjectReport {
  folder: string | null;
  slug: string;
  title: string;
  slots: Record<SlotName, SlotState>;
  brokenMedia: { url: string; reason: string }[];
  publicPage: PageCheck | null;
  cmsPage: PageCheck | null;
}

interface ApiProperty {
  slug: string;
  title: string;
  featuredImage: string;
  heroImages: string[];
  gallery: string[];
  masterPlan: string;
  developerLogo?: string | null;
  floorPlans: { image: string }[];
  seo?: { ogImage?: string | null };
}

/** Absolute form of a stored media reference (they may be relative or absolute). */
const absolute = (url: string): string =>
  url.startsWith("http") ? url : `${assetOrigin}${url.startsWith("/") ? "" : "/"}${url}`;

interface Envelope<T> {
  success?: boolean;
  data?: T;
}

/**
 * Reads every property through the admin API from inside the page, so the
 * request carries the session the CMS itself is using.
 */
async function fetchProperties(context: BrowserContext, page: Page): Promise<ApiProperty[]> {
  const payload = (await page.evaluate(async (apiUrl) => {
    const res = await fetch(`${apiUrl}/properties`, { credentials: "include" });
    return res.json();
  }, config.apiUrl)) as Envelope<ApiProperty[]>;

  if (payload?.success && payload.data) return payload.data;

  // The page's access token lives in memory only; fall back to the context
  // request, which still replays the refresh cookie.
  const res = await context.request.get(`${config.apiUrl}/properties`);
  const body = (await res.json()) as Envelope<ApiProperty[]>;
  if (!body?.success || !body.data) throw new Error("Could not read /properties from the admin API");
  return body.data;
}

/** HEAD/GET each referenced media URL and flag anything that isn't a live image. */
async function checkMedia(context: BrowserContext, urls: string[]): Promise<{ url: string; reason: string }[]> {
  const broken: { url: string; reason: string }[] = [];
  const seen = new Set<string>();

  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    try {
      const res = await context.request.get(absolute(url), { timeout: 30_000 });
      if (!res.ok()) {
        broken.push({ url, reason: `HTTP ${res.status()}` });
        continue;
      }
      const type = res.headers()["content-type"] ?? "";
      if (!type.startsWith("image/")) broken.push({ url, reason: `content-type ${type || "unknown"}` });
    } catch (error) {
      broken.push({ url, reason: error instanceof Error ? error.message : String(error) });
    }
  }
  return broken;
}

/**
 * Loads a public project page and confirms every `<img>` actually decoded.
 *
 * Next/Image lazy-loads below the fold, so the page is scrolled end to end
 * first — without that, off-screen images report `naturalWidth === 0` and look
 * broken when they are merely not requested yet.
 */
async function checkPublicPage(context: BrowserContext, slug: string): Promise<PageCheck> {
  const page = await context.newPage();
  const failedResponses: string[] = [];
  page.on("response", (r) => {
    if (r.request().resourceType() === "image" && r.status() >= 400) {
      failedResponses.push(`HTTP ${r.status()} ${r.url()}`);
    }
  });

  try {
    const response = await page.goto(`${config.adminUrl}/projects/${slug}`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    if (!response || response.status() >= 400) {
      return { ok: false, imageCount: 0, broken: [], reason: `page returned HTTP ${response?.status() ?? "?"}` };
    }

    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height + 2000; y += 800) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(160);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2_000);

    const images = await page.locator("img").evaluateAll((nodes) =>
      nodes.map((n) => {
        const img = n as HTMLImageElement;
        return { src: img.currentSrc || img.src, width: img.naturalWidth };
      }),
    );

    const broken = [
      ...images.filter((i) => i.width === 0).map((i) => `did not decode: ${i.src}`),
      ...failedResponses,
    ];
    return { ok: broken.length === 0, imageCount: images.length, broken };
  } catch (error) {
    return {
      ok: false,
      imageCount: 0,
      broken: [],
      reason: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await page.close();
  }
}

/**
 * Opens a property's edit drawer in the CMS and confirms every preview thumbnail
 * decodes — featured, each hero/gallery row, master plan, each floor plan and
 * the developer logo. Previews are `loading="lazy"` inside the drawer's own
 * scroll container, so that container is scrolled before anything is measured.
 */
async function checkCmsPage(page: Page, slug: string, log: Logger): Promise<PageCheck> {
  const failedResponses: string[] = [];
  const onResponse = (r: { request(): { resourceType(): string }; status(): number; url(): string }) => {
    if (r.request().resourceType() === "image" && r.status() >= 400) {
      failedResponses.push(`HTTP ${r.status()} ${r.url()}`);
    }
  };
  page.on("response", onResponse);

  const drawer = new PropertyDrawer(page, log);
  try {
    const row = await drawer.findRow(slug);
    if (!row) return { ok: false, imageCount: 0, broken: [], reason: "property row not found in the CMS list" };

    await drawer.openEdit(row);

    // Scroll the drawer body so every lazy preview is actually requested.
    // The drawer is the LAST <aside> — the first is the admin sidebar, which
    // has its own `.overflow-y-auto` and would otherwise be scrolled instead.
    await page.evaluate(async () => {
      const asides = document.querySelectorAll("aside");
      const scroller = asides[asides.length - 1]?.querySelector<HTMLElement>(".overflow-y-auto");
      if (!scroller) return;
      for (let y = 0; y <= scroller.scrollHeight; y += 300) {
        scroller.scrollTop = y;
        await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
      }
      scroller.scrollTop = 0;
    });
    await page.waitForTimeout(2_500);

    const images = await page.locator("aside img").evaluateAll((nodes) =>
      nodes.map((n) => {
        const img = n as HTMLImageElement;
        return { src: img.currentSrc || img.src, width: img.naturalWidth };
      }),
    );

    const broken = [
      ...images.filter((i) => i.width === 0).map((i) => `preview did not decode: ${i.src}`),
      ...failedResponses,
    ];
    await drawer.cancel();
    return { ok: broken.length === 0, imageCount: images.length, broken };
  } catch (error) {
    await drawer.cancel().catch(() => undefined);
    return {
      ok: false,
      imageCount: 0,
      broken: [],
      reason: error instanceof Error ? error.message : String(error),
    };
  } finally {
    page.off("response", onResponse);
  }
}

function buildSlots(property: ApiProperty, folder: string | null): Record<SlotName, SlotState> {
  const files = folder ? readProjectFiles(config.imagesRoot, folder, property.slug) : null;

  const make = (count: number, hasLocalFile: boolean): SlotState => ({
    present: count > 0,
    count,
    fixable: count === 0 && hasLocalFile,
    unavailable: count === 0 && !hasLocalFile,
  });

  return {
    "Featured Image": make(property.featuredImage ? 1 : 0, Boolean(files?.featured)),
    "Hero Images": make(property.heroImages.length, (files?.hero.length ?? 0) > 0),
    "Gallery Images": make(property.gallery.length, (files?.gallery.length ?? 0) > 0),
    "Floor Plans": make(property.floorPlans.length, (files?.floorPlans.length ?? 0) > 0),
    "Master Plan": make(property.masterPlan ? 1 : 0, Boolean(files?.masterPlan)),
    "Developer Logo": make(property.developerLogo ? 1 : 0, Boolean(files?.developerLogo)),
  };
}

export interface VerifyOptions {
  /** Restrict to these folders; empty means every folder that has an image dir. */
  folders?: string[];
  /** Skip the (slow) public-page pass. */
  skipPublicPages?: boolean;
  /** Skip opening each property's edit drawer in the CMS. */
  skipCmsPages?: boolean;
}

export async function verify(options: VerifyOptions = {}): Promise<ProjectReport[]> {
  const folders = listProjectFolders(config.imagesRoot);
  const slugToFolder = new Map(folders.map((f) => [slugForFolder(f), f]));
  const wanted = options.folders?.length ? new Set(options.folders) : null;

  const browser = await chromium.launch({ headless: config.headless });
  const reports: ProjectReport[] = [];

  try {
    const { context, page } = await createSession(browser, rootLogger);
    const properties = await fetchProperties(context, page);

    for (const property of properties) {
      const folder = slugToFolder.get(property.slug) ?? null;
      // Seed-only records with no image folder aren't part of this migration.
      if (!folder) continue;
      if (wanted && !wanted.has(folder)) continue;

      const log = rootLogger.child(folder);
      log.step("verifying");

      const urls = [
        property.featuredImage,
        property.masterPlan,
        property.developerLogo ?? "",
        ...property.heroImages,
        ...property.gallery,
        ...property.floorPlans.map((f) => f.image),
      ].filter(Boolean);

      const brokenMedia = await checkMedia(context, urls);
      const cmsPage = options.skipCmsPages ? null : await checkCmsPage(page, property.slug, log);
      const publicPage = options.skipPublicPages ? null : await checkPublicPage(context, property.slug);
      const slots = buildSlots(property, folder);

      reports.push({
        folder,
        slug: property.slug,
        title: property.title,
        slots,
        brokenMedia,
        publicPage,
        cmsPage,
      });

      const missing = SLOTS.filter((s) => !slots[s].present);
      log.info(
        `${urls.length} media refs · ${brokenMedia.length} broken · ` +
          `CMS ${cmsPage ? (cmsPage.ok ? `OK (${cmsPage.imageCount} previews)` : "ISSUES") : "skipped"} · ` +
          `public ${publicPage ? (publicPage.ok ? `OK (${publicPage.imageCount} images)` : "ISSUES") : "skipped"}` +
          `${missing.length ? ` · missing: ${missing.join(", ")}` : " · all slots present"}`,
      );
    }

    await context.storageState({ path: config.storageStatePath });
    await context.close();
  } finally {
    await browser.close();
  }

  return reports;
}

/* ------------------------------ PASS / FAIL ------------------------------- */

export const COLUMNS = [
  "Featured",
  "Hero",
  "Gallery",
  "Master Plan",
  "Floor Plans",
  "Developer Logo",
  "CMS Page",
  "Public Page",
] as const;
export type ColumnName = (typeof COLUMNS)[number];

const COLUMN_SLOT: Record<Exclude<ColumnName, "CMS Page" | "Public Page">, SlotName> = {
  Featured: "Featured Image",
  Hero: "Hero Images",
  Gallery: "Gallery Images",
  "Master Plan": "Master Plan",
  "Floor Plans": "Floor Plans",
  "Developer Logo": "Developer Logo",
};

export interface ResultRow {
  project: string;
  slug: string;
  folder: string | null;
  results: Record<ColumnName, "PASS" | "FAIL">;
  /** Reason per failing column. */
  reasons: Partial<Record<ColumnName, string>>;
}

/**
 * A slot passes when it is populated *and* none of the property's media URLs is
 * broken. Page columns pass when every image on that page decoded.
 */
export function toResultRow(report: ProjectReport): ResultRow {
  const results = {} as Record<ColumnName, "PASS" | "FAIL">;
  const reasons: Partial<Record<ColumnName, string>> = {};
  const mediaHealthy = report.brokenMedia.length === 0;

  for (const column of COLUMNS) {
    if (column === "CMS Page" || column === "Public Page") {
      const check = column === "CMS Page" ? report.cmsPage : report.publicPage;
      if (!check) {
        results[column] = "PASS";
        continue;
      }
      results[column] = check.ok ? "PASS" : "FAIL";
      if (!check.ok) {
        reasons[column] = check.reason ?? `${check.broken.length} image(s) did not render`;
      }
      continue;
    }

    const slot = report.slots[COLUMN_SLOT[column]];
    if (!slot.present) {
      results[column] = "FAIL";
      reasons[column] = slot.fixable
        ? "empty in the CMS, file is on disk"
        : "no such asset published by the source website";
    } else if (!mediaHealthy) {
      results[column] = "FAIL";
      reasons[column] = `${report.brokenMedia.length} broken media URL(s) on this property`;
    } else {
      results[column] = "PASS";
    }
  }

  return { project: report.title, slug: report.slug, folder: report.folder, results, reasons };
}

export function printResultTable(reports: ProjectReport[]): ResultRow[] {
  const rows = reports.map(toResultRow);
  const nameWidth = Math.max(12, ...rows.map((r) => r.project.length));

  rootLogger.rule("VERIFICATION REPORT");
  console.log("");

  const widths = COLUMNS.map((c) => Math.max(c.length, 4) + 2);
  const header =
    "Project".padEnd(nameWidth) +
    "  " +
    COLUMNS.map((c, i) => c.padEnd(widths[i])).join("");
  console.log(header);
  console.log("─".repeat(header.length));

  for (const row of rows) {
    const cells = COLUMNS.map((c, i) => row.results[c].padEnd(widths[i])).join("");
    console.log(row.project.padEnd(nameWidth) + "  " + cells);
  }

  const failing = rows.filter((r) => COLUMNS.some((c) => r.results[c] === "FAIL"));
  if (failing.length > 0) {
    console.log("\nFAIL detail:");
    for (const row of failing) {
      for (const column of COLUMNS) {
        if (row.results[column] === "FAIL") {
          console.log(`  ${row.project} · ${column} — ${row.reasons[column]}`);
        }
      }
    }
  }

  const totalCells = rows.length * COLUMNS.length;
  const failedCells = rows.reduce(
    (n, r) => n + COLUMNS.filter((c) => r.results[c] === "FAIL").length,
    0,
  );
  console.log(
    `\n${totalCells - failedCells}/${totalCells} checks PASS · ${failedCells} FAIL · ` +
      `${rows.length - failing.length}/${rows.length} projects fully green\n`,
  );

  return rows;
}

export function printVerification(reports: ProjectReport[]): void {
  rootLogger.rule("VERIFICATION");

  for (const report of reports) {
    console.log(`\n  ${report.title}  (/${report.slug})`);
    for (const slot of SLOTS) {
      const state = report.slots[slot];
      const mark = state.present ? "✓" : state.fixable ? "✕" : "○";
      const note = state.present
        ? `${state.count}`
        : state.fixable
          ? "MISSING — file is on disk, repairable"
          : "not published by the source website";
      console.log(`    ${mark} ${slot.padEnd(16)} ${note}`);
    }
    if (report.brokenMedia.length > 0) {
      console.log(`    ! ${report.brokenMedia.length} broken media URL(s):`);
      for (const b of report.brokenMedia.slice(0, 5)) console.log(`        ${b.reason} — ${b.url}`);
    }
    for (const [label, check] of [
      ["CMS page", report.cmsPage],
      ["Public page", report.publicPage],
    ] as const) {
      if (!check) continue;
      console.log(
        `    ${check.ok ? "✓" : "✕"} ${label.padEnd(16)} ${check.imageCount} image(s) rendered` +
          `${check.reason ? ` — ${check.reason}` : ""}`,
      );
      for (const b of check.broken.slice(0, 5)) console.log(`        ${b}`);
    }
  }
  console.log("");
}

/** Folders whose gaps can be closed by re-running the uploader. */
export const repairableFolders = (reports: ProjectReport[]): string[] =>
  reports
    .filter(
      (r) =>
        r.folder !== null &&
        // Only slots with a file on disk are worth another upload pass; a slot
        // the source website never published cannot be repaired by retrying.
        (SLOTS.some((s) => r.slots[s].fixable) ||
          r.brokenMedia.length > 0 ||
          (r.cmsPage !== null && !r.cmsPage.ok) ||
          (r.publicPage !== null && !r.publicPage.ok)),
    )
    .map((r) => r.folder as string);

/** `npm run verify -- [folder …]` */
async function main(): Promise<void> {
  const folders = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const reports = await verify({ folders });
  const rows = printResultTable(reports);
  if (rows.some((r) => COLUMNS.some((c) => r.results[c] === "FAIL"))) process.exitCode = 1;
}

if (process.argv[1] && process.argv[1].endsWith("verify.ts")) {
  main().catch((error) => {
    rootLogger.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
  });
}
