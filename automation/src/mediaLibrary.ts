import type { Locator, Page } from "playwright";
import { config } from "./config";
import { readBuffer, type ImageFile } from "./files";
import type { Logger } from "./logger";
import { mediaCard, mediaDialog, waitUntil } from "./locators";

/**
 * Drives the Media Library modal.
 *
 * Upload flow discovered by inspection:
 *   hidden `input[type=file][multiple]` -> POST {api}/media/upload -> 201
 *   -> react-query invalidates -> GET {api}/media re-renders the grid.
 *
 * Files are uploaded under a per-project unique name (`<slug>__<file>`) because
 * the library search matches on the stored original file name and every folder
 * ships the same generic names (`featured.jpg`, `hero-1.jpg`, …). The unique
 * name is also what makes re-runs idempotent: an already-uploaded file is found
 * and reused instead of duplicated.
 */
export class MediaLibrary {
  private readonly dialog: Locator;

  constructor(private readonly page: Page, private readonly log: Logger) {
    this.dialog = mediaDialog(page);
  }

  private get searchBox(): Locator {
    return this.dialog.locator('input[placeholder*="Search files" i]');
  }

  private get fileInput(): Locator {
    // The card "replace" inputs are single-file; only the library uploader is multiple.
    return this.dialog.locator('input[type="file"][multiple]');
  }

  async waitForOpen(): Promise<void> {
    await this.page
      .getByRole("heading", { name: "Media Library" })
      .waitFor({ state: "visible", timeout: config.timeouts.action });
    await this.dialog.locator('input[placeholder*="Search files" i]').waitFor({
      timeout: config.timeouts.action,
    });
  }

  async waitForClosed(): Promise<void> {
    await this.page
      .getByRole("heading", { name: "Media Library" })
      .waitFor({ state: "detached", timeout: config.timeouts.action });
  }

  /** The term currently in the search box, so repeat searches are no-ops. */
  private currentSearch: string | null = null;

  /**
   * Filters the grid. The list query is cached by react-query, so a repeated
   * term produces no network request at all — the response wait is therefore
   * best-effort and short, with callers polling for the card they expect.
   */
  private async search(term: string, force = false): Promise<void> {
    if (!force && this.currentSearch === term) return;

    const listResponse = this.page
      .waitForResponse((r) => r.url().includes("/media?") && r.url().includes("search="), {
        timeout: 5_000,
      })
      .catch(() => null);
    await this.searchBox.fill(term);
    this.currentSearch = term;
    await listResponse;
    // Let React commit the re-render before anything is counted.
    await this.page.waitForTimeout(250);
  }

  /** Re-issues the current query so freshly uploaded rows are pulled in. */
  private async refresh(term: string): Promise<void> {
    await this.searchBox.fill("");
    this.currentSearch = "";
    await this.page.waitForTimeout(150);
    await this.search(term, true);
  }

  private async cardExists(uploadName: string): Promise<boolean> {
    return (await mediaCard(this.dialog, uploadName).count()) > 0;
  }

  /**
   * Ensures every file exists in the library, uploading the missing ones in a
   * single multipart request. Returns the upload names now present.
   */
  async ensureUploaded(files: ImageFile[]): Promise<string[]> {
    const missing: ImageFile[] = [];

    for (const file of files) {
      await this.search(file.uploadName);
      if (await this.cardExists(file.uploadName)) {
        this.log.info(`already in library, reusing: ${file.uploadName}`);
      } else {
        missing.push(file);
      }
    }

    if (missing.length > 0) {
      this.log.step(`uploading ${missing.length} file(s): ${missing.map((f) => f.fileName).join(", ")}`);
      const uploadResponse = this.page.waitForResponse(
        (r) => r.url().includes("/media/upload") && r.request().method() === "POST",
        { timeout: config.timeouts.upload },
      );
      await this.fileInput.setInputFiles(
        missing.map((f) => ({
          name: f.uploadName,
          mimeType: f.mimeType,
          buffer: readBuffer(f),
        })),
      );
      const response = await uploadResponse;
      if (!response.ok()) {
        const body = await response.text().catch(() => "");
        throw new Error(`Upload failed (HTTP ${response.status()}): ${body.slice(0, 200)}`);
      }
      this.log.ok(`uploaded ${missing.length} file(s)`);

      // The grid only reflects the new rows once the invalidated list refetches.
      for (const file of missing) {
        const appeared = await waitUntil(async () => {
          await this.refresh(file.uploadName);
          return this.cardExists(file.uploadName);
        }, 20_000, 500);
        if (!appeared) throw new Error(`Uploaded file never appeared in library: ${file.uploadName}`);
      }
    }

    return files.map((f) => f.uploadName);
  }

  /** Single-select mode: clicking a card commits immediately and closes the modal. */
  async pickOne(file: ImageFile): Promise<void> {
    await this.ensureUploaded([file]);
    await this.search(file.uploadName);
    const card = mediaCard(this.dialog, file.uploadName).first();
    await card.waitFor({ state: "visible", timeout: config.timeouts.action });
    await card.click();
    await this.waitForClosed();
  }

  /**
   * Multi-select mode: cards accumulate, then "Insert N" commits them. Selection
   * order is preserved by the component, so clicking in file order yields the
   * intended slider/gallery order.
   */
  async pickMany(files: ImageFile[]): Promise<void> {
    if (files.length === 0) return;
    await this.ensureUploaded(files);

    // A single prefix search keeps every card of this group on one page.
    const prefix = commonPrefix(files.map((f) => f.uploadName));
    await this.search(prefix, true);

    for (const file of files) {
      const card = mediaCard(this.dialog, file.uploadName).first();
      await card.waitFor({ state: "visible", timeout: config.timeouts.action });
      await card.click();
      await this.page.waitForTimeout(120);
    }

    const insert = this.dialog.getByRole("button", { name: /^insert/i });
    await insert.waitFor({ state: "visible", timeout: config.timeouts.action });
    await insert.click();
    await this.waitForClosed();
  }
}

function commonPrefix(values: string[]): string {
  if (values.length === 0) return "";
  let prefix = values[0];
  for (const value of values.slice(1)) {
    while (!value.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}
