import { downloadProjects, printDownloadSummary } from "./download";
import { printSummary, runUploads } from "./index";
import { rootLogger } from "./logger";

/**
 * Download then upload, in one pass.
 *
 * `npm run sync -- meenakshi-elan prestige-budvel`
 *
 * Folders whose download failed outright are not handed to the uploader — a
 * half-downloaded folder would otherwise be published with images missing.
 */
async function main(): Promise<void> {
  const folders = process.argv.slice(2).filter((a) => !a.startsWith("-"));

  rootLogger.rule("STEP 1 / 2 — DOWNLOAD");
  const downloads = await downloadProjects(folders);
  printDownloadSummary(downloads);

  const ready = downloads.filter((d) => d.failed.length === 0).map((d) => d.folder);
  const broken = downloads.filter((d) => d.failed.length > 0).map((d) => d.folder);

  for (const folder of broken) {
    rootLogger.error(`skipping upload for "${folder}" — some images failed to download`);
  }

  if (ready.length === 0) {
    rootLogger.error("nothing downloaded cleanly; not running the upload step");
    process.exitCode = 1;
    return;
  }

  rootLogger.rule("STEP 2 / 2 — UPLOAD");
  const uploads = await runUploads(ready);
  printSummary(uploads);

  const failed = broken.length > 0 || uploads.some((o) => o.status === "failed");
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  rootLogger.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
