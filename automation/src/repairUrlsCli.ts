import { chromium } from "playwright";
import { config } from "./config";
import { rootLogger } from "./logger";
import { repairAbsoluteMediaUrls } from "./repairUrls";
import { createSession } from "./session";

/** `npm run repair:urls -- [slug …]` */
async function main(): Promise<void> {
  const slugs = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const browser = await chromium.launch({ headless: config.headless });
  try {
    const { context } = await createSession(browser, rootLogger);
    const results = await repairAbsoluteMediaUrls(
      context,
      rootLogger.child("url-repair"),
      slugs.length > 0 ? slugs : undefined,
    );
    rootLogger.ok(
      `normalised ${results.reduce((n, r) => n + r.changed, 0)} URL(s) across ${results.length} propert${results.length === 1 ? "y" : "ies"}`,
    );
    await context.storageState({ path: config.storageStatePath });
    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  rootLogger.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
