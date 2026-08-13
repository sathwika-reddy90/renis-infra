import { chromium } from "playwright";
import { config, slugForFolder } from "./config";
import { listProjectFolders, readProjectFiles, type ImageFile, type ProjectFiles } from "./files";
import { Logger, rootLogger } from "./logger";
import { PropertyDrawer } from "./propertyDrawer";
import { createSession } from "./session";

export interface ProjectOutcome {
  folder: string;
  slug: string;
  status: "completed" | "failed" | "skipped";
  uploaded: number;
  skipped: string[];
  repairs: string[];
  reason?: string;
}

/** Runs `task`, retrying transient failures with a short linear backoff. */
async function withRetry<T>(label: string, log: Logger, task: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= config.uploadRetries; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (attempt < config.uploadRetries) {
        log.warn(`${label} failed (attempt ${attempt}/${config.uploadRetries}): ${message} — retrying`);
        await new Promise((r) => setTimeout(r, 1_000 * attempt));
      } else {
        log.error(`${label} failed after ${config.uploadRetries} attempts: ${message}`);
      }
    }
  }
  throw lastError;
}

async function processProject(
  drawer: PropertyDrawer,
  files: ProjectFiles,
  log: Logger,
): Promise<ProjectOutcome> {
  const outcome: ProjectOutcome = {
    folder: files.folder,
    slug: files.slug,
    status: "failed",
    uploaded: 0,
    skipped: [],
    repairs: [],
  };

  if (files.total === 0) {
    outcome.status = "skipped";
    outcome.reason = "folder contains no recognised images";
    log.skip(outcome.reason);
    return outcome;
  }
  if (files.unmatched.length > 0) {
    log.warn(`ignoring unrecognised file(s): ${files.unmatched.join(", ")}`);
  }

  const row = await drawer.findRow(files.slug);
  if (!row) {
    outcome.status = "failed";
    outcome.reason = `no property found with slug "${files.slug}"`;
    log.error(outcome.reason);
    return outcome;
  }

  await drawer.openEdit(row);
  log.step("edit drawer open");

  try {
    // Clear blockers up front so a mid-run validation error can't be mistaken
    // for an upload problem.
    outcome.repairs.push(...(await drawer.repairBlockingFields()));

    const single: { label: string; file?: ImageFile }[] = [
      { label: "Featured image", file: files.featured },
      { label: "Master plan image", file: files.masterPlan },
      { label: "Developer logo (optional)", file: files.developerLogo },
    ];

    for (const { label, file } of single) {
      if (!file) {
        outcome.skipped.push(label);
        log.skip(`${label}: no file in folder`);
        continue;
      }
      await withRetry(label, log, () => drawer.setSingleImage(label, file));
      outcome.uploaded += 1;
    }

    const lists: { label: string; items: ImageFile[] }[] = [
      { label: "Hero slider images", items: files.hero },
      { label: "Gallery images", items: files.gallery },
    ];

    for (const { label, items } of lists) {
      if (items.length === 0) {
        outcome.skipped.push(label);
        log.skip(`${label}: no files in folder`);
        continue;
      }
      if (config.replaceLists) await drawer.clearList(label);
      await withRetry(label, log, () => drawer.addListImages(label, items));
      outcome.uploaded += items.length;
    }

    if (files.floorPlans.length === 0) {
      outcome.skipped.push("Floor plans");
      log.skip("Floor plans: no files in folder");
    } else {
      await withRetry("Floor plans", log, () => drawer.addFloorPlans(files.floorPlans));
      outcome.uploaded += files.floorPlans.length;
    }

    if (config.dryRun) {
      log.warn("DRY_RUN=1 — discarding changes instead of saving");
      await drawer.cancel();
      outcome.status = "completed";
      outcome.reason = "dry run (not saved)";
      return outcome;
    }

    const result = await drawer.save();
    if (result.saved) {
      log.ok(`saved (HTTP ${result.status})`);
      outcome.status = "completed";
    } else {
      outcome.status = "failed";
      outcome.reason = `save blocked — ${(result.blockedBy ?? []).join("; ")}`;
      log.error(outcome.reason);
      await drawer.cancel();
    }
  } catch (error) {
    outcome.status = "failed";
    outcome.reason = error instanceof Error ? error.message : String(error);
    log.error(`aborted: ${outcome.reason}`);
    await drawer.cancel().catch(() => undefined);
  }

  return outcome;
}

export function printSummary(outcomes: ProjectOutcome[]): void {
  const bucket = (status: ProjectOutcome["status"]) => outcomes.filter((o) => o.status === status);

  rootLogger.rule("SUMMARY");

  console.log(`\nCompleted: ${bucket("completed").length}`);
  for (const o of bucket("completed")) {
    const notes = [`${o.uploaded} image(s)`];
    if (o.skipped.length) notes.push(`skipped: ${o.skipped.join(", ")}`);
    if (o.reason) notes.push(o.reason);
    console.log(`  ✓ ${o.folder} → /${o.slug} — ${notes.join(" · ")}`);
    for (const r of o.repairs) console.log(`      repaired ${r}`);
  }

  console.log(`\nFailed: ${bucket("failed").length}`);
  for (const o of bucket("failed")) {
    console.log(`  ✕ ${o.folder} → /${o.slug} — ${o.reason ?? "unknown error"}`);
  }

  console.log(`\nSkipped: ${bucket("skipped").length}`);
  for (const o of bucket("skipped")) {
    console.log(`  – ${o.folder} — ${o.reason ?? "nothing to do"}`);
  }
  console.log("");
}

/**
 * Uploads the given project folders (or every folder under `imagesRoot` when
 * none are named). Exported so `sync` can chain download → upload in one run.
 */
export async function runUploads(only: string[] = []): Promise<ProjectOutcome[]> {
  const folders = listProjectFolders(config.imagesRoot).filter(
    (f) => only.length === 0 || only.includes(f),
  );

  if (folders.length === 0) {
    rootLogger.error(`No project folders found under ${config.imagesRoot}`);
    return [];
  }

  rootLogger.info(`images root : ${config.imagesRoot}`);
  rootLogger.info(`admin       : ${config.adminUrl}`);
  rootLogger.info(`projects    : ${folders.length}`);
  rootLogger.info(`mode        : ${config.dryRun ? "DRY RUN" : "live"} · lists ${config.replaceLists ? "replaced" : "appended"} · repair ${config.repair}`);

  const browser = await chromium.launch({ headless: config.headless, slowMo: config.slowMo });
  const outcomes: ProjectOutcome[] = [];

  try {
    const { context, page } = await createSession(browser, rootLogger);
    page.setDefaultTimeout(config.timeouts.action);

    for (const folder of folders) {
      const slug = slugForFolder(folder);
      const log = rootLogger.child(folder);
      rootLogger.rule(`${folder}  →  /${slug}`);

      const files = readProjectFiles(config.imagesRoot, folder, slug);
      log.info(
        `featured=${files.featured ? 1 : 0} hero=${files.hero.length} gallery=${files.gallery.length} ` +
          `masterPlan=${files.masterPlan ? 1 : 0} floorPlans=${files.floorPlans.length} logo=${files.developerLogo ? 1 : 0}`,
      );

      // One project failing must never stop the run.
      try {
        outcomes.push(await processProject(new PropertyDrawer(page, log), files, log));
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        log.error(`unrecoverable: ${reason}`);
        outcomes.push({ folder, slug, status: "failed", uploaded: 0, skipped: [], repairs: [], reason });
      }
    }

    // Persist at the end, not at sign-in: the refresh cookie is rotated during
    // the run, so only the final one is still valid for the next run.
    await context.storageState({ path: config.storageStatePath });
    await context.close();
  } finally {
    await browser.close();
  }

  return outcomes;
}

/** `npm run upload -- [folder …]` */
async function main(): Promise<void> {
  const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const outcomes = await runUploads(only);
  printSummary(outcomes);
  if (outcomes.length === 0 || outcomes.some((o) => o.status === "failed")) process.exitCode = 1;
}

// Only run when invoked directly, so `sync` can import `runUploads`.
if (process.argv[1] && process.argv[1].endsWith("index.ts")) {
  main().catch((error) => {
    rootLogger.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
  });
}
