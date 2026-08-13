import { chromium, type BrowserContext } from "playwright";
import { downloadProjects } from "./download";
import { listProjectFolders } from "./files";
import { config } from "./config";
import { runUploads, type ProjectOutcome } from "./index";
import { rootLogger } from "./logger";
import { repairAbsoluteMediaUrls } from "./repairUrls";
import { createSession } from "./session";
import {
  COLUMNS,
  printResultTable,
  printVerification,
  repairableFolders,
  SLOTS,
  toResultRow,
  verify,
  type ProjectReport,
  type SlotName,
} from "./verify";

/**
 * End-to-end migration: download → upload → verify → repair → verify.
 *
 * `npm run migrate` (optionally with folder names) runs until every project is
 * either complete or blocked by something the source website simply doesn't
 * publish. Nothing here is interactive.
 */

const MAX_REPAIR_PASSES = 2;

/** Runs `task` with an authenticated admin browser context. */
async function withSession<T>(task: (context: BrowserContext) => Promise<T>): Promise<T> {
  const browser = await chromium.launch({ headless: config.headless });
  try {
    const { context } = await createSession(browser, rootLogger);
    const result = await task(context);
    await context.storageState({ path: config.storageStatePath });
    await context.close();
    return result;
  } finally {
    await browser.close();
  }
}

interface Totals {
  downloaded: number;
  uploaded: number;
  completed: string[];
  skipped: string[];
  failed: { folder: string; reason: string }[];
}

function mergeUploadOutcomes(totals: Totals, outcomes: ProjectOutcome[]): void {
  for (const outcome of outcomes) {
    totals.uploaded += outcome.uploaded;
    if (outcome.status === "failed") {
      totals.failed.push({ folder: outcome.folder, reason: outcome.reason ?? "unknown" });
    }
  }
}

function finalReport(totals: Totals, reports: ProjectReport[]): void {
  rootLogger.rule("MIGRATION REPORT");

  const complete: string[] = [];
  const partial: { folder: string; notPublished: SlotName[]; repairable: SlotName[] }[] = [];
  const broken: { folder: string; issues: string[] }[] = [];

  for (const report of reports) {
    const folder = report.folder ?? report.slug;
    const missing = SLOTS.filter((s) => !report.slots[s].present);
    const issues = [
      ...report.brokenMedia.map((b) => `${b.reason} — ${b.url}`),
      ...(report.publicPage && !report.publicPage.ok
        ? [report.publicPage.reason ?? `${report.publicPage.broken.length} image(s) did not render`]
        : []),
    ];

    if (issues.length > 0) broken.push({ folder, issues });
    if (missing.length === 0) {
      complete.push(folder);
    } else {
      partial.push({
        folder,
        notPublished: missing.filter((m) => report.slots[m].unavailable),
        repairable: missing.filter((m) => !report.slots[m].unavailable),
      });
    }
  }

  console.log(`\nCompleted: ${complete.length}`);
  for (const f of complete) console.log(`  ✓ ${f} — all six slots populated, images verified`);

  console.log(`\nSkipped: ${totals.skipped.length + partial.length}`);
  for (const f of totals.skipped) console.log(`  – ${f} — nothing to do`);
  for (const p of partial) {
    const parts: string[] = [];
    if (p.notPublished.length) parts.push(`not published by source: ${p.notPublished.join(", ")}`);
    if (p.repairable.length) parts.push(`still missing: ${p.repairable.join(", ")}`);
    console.log(`  – ${p.folder} — ${parts.join(" · ")}`);
  }

  console.log(`\nFailed: ${totals.failed.length + broken.length}`);
  for (const f of totals.failed) console.log(`  ✕ ${f.folder} — ${f.reason}`);
  for (const b of broken) {
    console.log(`  ✕ ${b.folder} — ${b.issues.length} image issue(s)`);
    for (const i of b.issues.slice(0, 3)) console.log(`      ${i}`);
  }

  console.log(`\nDownloaded: ${totals.downloaded} file(s)`);
  console.log(`Uploaded:   ${totals.uploaded} image slot assignment(s)`);
  console.log("");
}

async function main(): Promise<void> {
  const requested = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const totals: Totals = { downloaded: 0, uploaded: 0, completed: [], skipped: [], failed: [] };

  /* ---------------------------- 1. download ---------------------------- */
  rootLogger.rule("STEP 1 — DOWNLOAD");
  const downloads = await downloadProjects(requested);
  for (const d of downloads) {
    totals.downloaded += d.downloaded;
    if (d.failed.length > 0) {
      totals.failed.push({
        folder: d.folder,
        reason: `${d.failed.length} file(s) failed to download: ${d.failed.map((f) => f.fileName).join(", ")}`,
      });
    }
  }
  rootLogger.info(`downloaded ${totals.downloaded} new file(s)`);

  /* ----------------------------- 2. upload ----------------------------- */
  const brokenDownloads = new Set(downloads.filter((d) => d.failed.length > 0).map((d) => d.folder));
  const uploadTargets = (
    requested.length > 0 ? requested : listProjectFolders(config.imagesRoot)
  ).filter((f) => !brokenDownloads.has(f));

  rootLogger.rule("STEP 2 — UPLOAD");
  mergeUploadOutcomes(totals, await runUploads(uploadTargets));

  /* ----------------------- 3. verify + repair loop ---------------------- */
  let reports: ProjectReport[] = [];
  for (let pass = 0; pass <= MAX_REPAIR_PASSES; pass += 1) {
    rootLogger.rule(pass === 0 ? "STEP 3 — VERIFY" : `STEP 3 — VERIFY (repair pass ${pass})`);
    reports = await verify({ folders: requested });
    printVerification(reports);
    printResultTable(reports);

    const needsRepair = repairableFolders(reports);
    if (needsRepair.length === 0) {
      rootLogger.ok("nothing left to repair");
      break;
    }
    if (pass === MAX_REPAIR_PASSES) {
      rootLogger.warn(`still unresolved after ${MAX_REPAIR_PASSES} repair passes: ${needsRepair.join(", ")}`);
      break;
    }

    rootLogger.rule(`STEP 4 — REPAIR (${needsRepair.join(", ")})`);

    // Blank CMS previews are almost always absolute backend URLs being dropped
    // by the backend's `Cross-Origin-Resource-Policy: same-origin` header, so
    // normalise those first — it is a data fix, not another upload pass.
    if (reports.some((r) => r.cmsPage && !r.cmsPage.ok)) {
      await withSession(async (context) => {
        await repairAbsoluteMediaUrls(context, rootLogger.child("url-repair"));
      });
    }

    mergeUploadOutcomes(totals, await runUploads(needsRepair));
  }

  /* ----------------------------- 4. report ----------------------------- */
  const allFolders = requested.length > 0 ? requested : listProjectFolders(config.imagesRoot);
  totals.skipped = allFolders.filter((f) => !reports.some((r) => r.folder === f));

  finalReport(totals, reports);

  const unresolved = reports
    .map(toResultRow)
    .some((row) => COLUMNS.some((c) => row.results[c] === "FAIL"));
  if (unresolved || totals.failed.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  rootLogger.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
