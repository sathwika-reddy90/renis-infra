import fs from "node:fs";
import path from "node:path";
import { chromium, type BrowserContext } from "playwright";
import { config } from "./config";
import { groupByFolder, parseImageList, type ListEntry } from "./imageList";
import { Logger, rootLogger } from "./logger";

/**
 * Downloads the images listed in `image-list.txt` through a real browser context.
 *
 * Both meenakshigroup.com and prestigehyderabad.com sit behind a bot filter that
 * answers `406 Not Acceptable` to a `python-requests/*` User-Agent, which is why
 * the Python downloader fails on exactly these two projects. Fetching through a
 * Chromium context sends a genuine browser User-Agent, `sec-ch-*` hints and an
 * `Accept: image/*` header, and carries whatever cookies the site set when the
 * project page was visited — so the filter passes the request through.
 */

/** Magic-byte sniff, so an HTML error page never lands on disk as a `.jpg`. */
function detectImage(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "jpeg";
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  if (buffer.subarray(0, 3).toString("ascii") === "GIF") return "gif";
  if (buffer.subarray(4, 8).toString("ascii") === "ftyp" && buffer.subarray(8, 12).toString("ascii").startsWith("avif")) return "avif";
  const head = buffer.subarray(0, 512).toString("utf8").trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return "svg";
  return null;
}

/** The project page for a host, used as Referer and to pick up cookies. */
function refererFor(url: string): string {
  const { origin, hostname } = new URL(url);
  if (hostname.includes("meenakshigroup.com")) return `${origin}/elan/luxury-apartments-lp/`;
  if (hostname.includes("prestigehyderabad.com")) return `${origin}/prestige-budvel/`;
  return origin;
}

/**
 * Client hints derived from the context's real Chromium User-Agent. Sending
 * these alongside the UA keeps the request self-consistent — a filter that
 * cross-checks `sec-ch-ua` against `user-agent` sees a coherent browser.
 */
function browserHeaders(userAgent: string, referer: string): Record<string, string> {
  const major = userAgent.match(/Chrome\/(\d+)/)?.[1] ?? "120";
  const platform = /Macintosh/.test(userAgent)
    ? '"macOS"'
    : /Windows/.test(userAgent)
      ? '"Windows"'
      : '"Linux"';

  return {
    accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9",
    referer,
    "user-agent": userAgent,
    "sec-ch-ua": `"Chromium";v="${major}", "Not(A:Brand";v="24", "Google Chrome";v="${major}"`,
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": platform,
    "sec-fetch-dest": "image",
    "sec-fetch-mode": "no-cors",
    "sec-fetch-site": "same-origin",
  };
}

async function fetchImage(
  context: BrowserContext,
  entry: ListEntry,
  referer: string,
  userAgent: string,
): Promise<Buffer> {
  // `context.request` shares the context's cookie jar, so anything the landing
  // page set is replayed here automatically.
  const response = await context.request.fetch(entry.url, {
    method: "GET",
    headers: browserHeaders(userAgent, referer),
    timeout: 60_000,
    maxRedirects: 5,
  });

  if (!response.ok()) {
    throw new Error(`HTTP ${response.status()} ${response.statusText()}`);
  }

  const buffer = await response.body();
  const kind = detectImage(buffer);
  if (!kind) {
    const contentType = response.headers()["content-type"] ?? "unknown";
    const looksLikeHtml = buffer.subarray(0, 200).toString("utf8").toLowerCase().includes("<html");
    throw new Error(
      `response was not an image (content-type: ${contentType}, ${buffer.length} bytes` +
        `${looksLikeHtml ? ", looks like an HTML error page" : ""})`,
    );
  }
  return buffer;
}

interface DownloadOutcome {
  folder: string;
  downloaded: number;
  reused: number;
  failed: { fileName: string; reason: string }[];
}

async function downloadFolder(
  context: BrowserContext,
  folder: string,
  entries: ListEntry[],
  log: Logger,
): Promise<DownloadOutcome> {
  const outcome: DownloadOutcome = { folder, downloaded: 0, reused: 0, failed: [] };
  const dir = path.join(config.imagesRoot, folder);
  fs.mkdirSync(dir, { recursive: true });

  // Visit the project page once so the context holds any cookie the bot filter
  // hands out, and so the Referer is a page that legitimately embeds the images.
  const referer = refererFor(entries[0].url);
  const page = await context.newPage();
  let userAgent = "";
  try {
    log.step(`warming up ${referer}`);
    await page.goto(referer, { waitUntil: "domcontentloaded", timeout: 60_000 });
    userAgent = await page.evaluate(() => navigator.userAgent);
    const cookies = await context.cookies(referer);
    log.info(`context carries ${cookies.length} cookie(s) for this host`);
  } catch (error) {
    log.warn(`could not load ${referer} (${error instanceof Error ? error.message : error}) — continuing`);
  } finally {
    if (!userAgent) userAgent = await page.evaluate(() => navigator.userAgent).catch(() => "");
    await page.close();
  }

  for (const entry of entries) {
    const target = path.join(dir, entry.fileName);

    if (!config.forceDownload && fs.existsSync(target) && fs.statSync(target).size > 0) {
      log.info(`already on disk, skipping: ${entry.fileName}`);
      outcome.reused += 1;
      continue;
    }

    let saved = false;
    for (let attempt = 1; attempt <= config.uploadRetries; attempt += 1) {
      try {
        const buffer = await fetchImage(context, entry, referer, userAgent);
        fs.writeFileSync(target, buffer);
        log.ok(`${entry.fileName} ← ${Math.round(buffer.length / 1024)} KB`);
        outcome.downloaded += 1;
        saved = true;
        break;
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        if (attempt < config.uploadRetries) {
          log.warn(`${entry.fileName} failed (attempt ${attempt}/${config.uploadRetries}): ${reason} — retrying`);
          await new Promise((r) => setTimeout(r, 1_000 * attempt));
        } else {
          log.error(`${entry.fileName} failed after ${config.uploadRetries} attempts: ${reason}`);
          outcome.failed.push({ fileName: entry.fileName, reason });
        }
      }
    }
    if (!saved && fs.existsSync(target) && fs.statSync(target).size === 0) {
      fs.unlinkSync(target); // never leave a zero-byte stub behind
    }
  }

  return outcome;
}

export async function downloadProjects(folders: string[]): Promise<DownloadOutcome[]> {
  const all = parseImageList(config.imageList);
  const grouped = groupByFolder(all);

  const wanted = folders.length > 0 ? folders : [...grouped.keys()];
  const missing = wanted.filter((f) => !grouped.has(f));
  for (const folder of missing) rootLogger.warn(`no entries in image list for "${folder}"`);

  const browser = await chromium.launch({ headless: config.headless, slowMo: config.slowMo });
  const outcomes: DownloadOutcome[] = [];

  try {
    // A default Chromium context already carries a real UA and client hints.
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    });

    for (const folder of wanted) {
      const entries = grouped.get(folder);
      if (!entries) continue;
      rootLogger.rule(`download  ${folder}  (${entries.length} file(s))`);
      outcomes.push(await downloadFolder(context, folder, entries, rootLogger.child(folder)));
    }

    await context.close();
  } finally {
    await browser.close();
  }

  return outcomes;
}

export function printDownloadSummary(outcomes: DownloadOutcome[]): void {
  rootLogger.rule("DOWNLOAD SUMMARY");
  for (const o of outcomes) {
    const parts = [`${o.downloaded} downloaded`];
    if (o.reused) parts.push(`${o.reused} already present`);
    if (o.failed.length) parts.push(`${o.failed.length} failed`);
    console.log(`  ${o.failed.length ? "✕" : "✓"} ${o.folder} — ${parts.join(" · ")}`);
    for (const f of o.failed) console.log(`      ${f.fileName}: ${f.reason}`);
  }
  console.log("");
}

/** `npm run download -- [folder …]` */
async function main(): Promise<void> {
  const folders = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  rootLogger.info(`image list  : ${config.imageList}`);
  rootLogger.info(`images root : ${config.imagesRoot}`);
  rootLogger.info(`folders     : ${folders.length > 0 ? folders.join(", ") : "all in list"}`);

  const outcomes = await downloadProjects(folders);
  printDownloadSummary(outcomes);
  if (outcomes.some((o) => o.failed.length > 0)) process.exitCode = 1;
}

// Only run when invoked directly, so `sync` can import `downloadProjects`.
if (process.argv[1] && process.argv[1].endsWith("download.ts")) {
  main().catch((error) => {
    rootLogger.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
  });
}
