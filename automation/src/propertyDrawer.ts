import type { Locator, Page } from "playwright";
import { assetOrigin, config } from "./config";
import type { ImageFile } from "./files";
import type { Logger } from "./logger";
import {
  drawer,
  exact,
  fieldByLabel,
  nthFieldByLabel,
  readFieldErrors,
  sectionByHeading,
  tableRows,
  waitUntil,
} from "./locators";
import { MediaLibrary } from "./mediaLibrary";

export interface SaveResult {
  saved: boolean;
  status?: number;
  blockedBy?: string[];
}

/** Page object for the properties list and its create/edit slide-over. */
export class PropertyDrawer {
  readonly root: Locator;

  constructor(private readonly page: Page, private readonly log: Logger) {
    this.root = drawer(page);
  }

  private get footer(): Locator {
    return this.root.locator("footer");
  }

  /* ------------------------------ navigation ------------------------------ */

  async gotoList(): Promise<void> {
    await this.page.goto(`${config.adminUrl}/admin/properties`, { waitUntil: "domcontentloaded" });
    await tableRows(this.page)
      .first()
      .locator("td")
      .first()
      .waitFor({ state: "visible", timeout: config.timeouts.action });
  }

  /**
   * Finds a property row by slug, paging through the (client-side paginated)
   * table. The table's search box filters on title/location/city — not slug —
   * so paging is the reliable way to match a folder name.
   */
  async findRow(slug: string): Promise<Locator | null> {
    await this.gotoList();
    for (let page = 1; page <= 20; page += 1) {
      const row = tableRows(this.page).filter({ hasText: `/${slug}` });
      if ((await row.count()) > 0) return row.first();

      const next = this.page.getByRole("button", { name: "Next page" });
      if ((await next.count()) === 0 || (await next.isDisabled())) return null;
      await next.click();
      await this.page.waitForTimeout(500);
    }
    return null;
  }

  async openEdit(row: Locator): Promise<void> {
    await row.getByRole("button", { name: "Edit property" }).click();
    await this.root
      .getByRole("heading", { name: "Edit Property" })
      .waitFor({ state: "visible", timeout: config.timeouts.action });
    // The form resets asynchronously from the row data.
    await this.page.waitForTimeout(500);
  }

  async isOpen(): Promise<boolean> {
    return (await this.page.getByRole("heading", { name: "Edit Property" }).count()) > 0;
  }

  async cancel(): Promise<void> {
    if (!(await this.isOpen())) return;
    await this.footer.getByRole("button", { name: "Cancel" }).click();
    await waitUntil(async () => !(await this.isOpen()), config.timeouts.action);
  }

  /* -------------------------------- media --------------------------------- */

  private async openPicker(field: Locator): Promise<MediaLibrary> {
    const library = new MediaLibrary(this.page, this.log);
    await field.getByRole("button", { name: /(select image|change image|add from media library)/i }).click();
    await library.waitForOpen();
    return library;
  }

  /** Sets a single-image field (Featured image / Master plan image / Developer logo). */
  async setSingleImage(label: string, file: ImageFile): Promise<void> {
    const field = fieldByLabel(this.root, label);
    await field.scrollIntoViewIfNeeded();
    const library = await this.openPicker(field);
    await library.pickOne(file);
    this.log.ok(`${label} ← ${file.fileName}`);
  }

  /** Number of entries currently in a multi-image field. */
  private listItems(label: string): Locator {
    return fieldByLabel(this.root, label).locator('p:has-text("/uploads/"), p:has-text("http")');
  }

  /** Removes every entry from a multi-image list field. */
  async clearList(label: string): Promise<number> {
    const field = fieldByLabel(this.root, label);
    let removed = 0;
    for (;;) {
      const remove = field.getByRole("button", { name: "Remove image" });
      if ((await remove.count()) === 0) break;
      await remove.first().click();
      removed += 1;
      await this.page.waitForTimeout(80);
      if (removed > 200) break; // safety valve
    }
    if (removed > 0) this.log.info(`${label}: cleared ${removed} existing entr${removed === 1 ? "y" : "ies"}`);
    return removed;
  }

  /** Appends files to a multi-image field (Hero slider images / Gallery images). */
  async addListImages(label: string, files: ImageFile[]): Promise<void> {
    if (files.length === 0) return;
    const field = fieldByLabel(this.root, label);
    await field.scrollIntoViewIfNeeded();

    const before = await field.getByRole("button", { name: "Remove image" }).count();
    const library = await this.openPicker(field);
    await library.pickMany(files);

    const after = await field.getByRole("button", { name: "Remove image" }).count();
    this.log.ok(`${label} ← ${files.length} file(s) (list ${before} → ${after})`);
  }

  /* ------------------------------ floor plans ----------------------------- */

  /**
   * Appends one Floor Plans row per image. `type` and `area` are required by the
   * form schema, so they are seeded with a derived name and the configured
   * placeholder — both are meant to be edited by hand afterwards.
   */
  async addFloorPlans(files: ImageFile[]): Promise<void> {
    if (files.length === 0) return;
    const section = sectionByHeading(this.root, "Floor Plans");
    await section.scrollIntoViewIfNeeded();

    for (const file of files) {
      const title = `Floor Plan ${file.index}`;
      let rowIndex = await this.findFloorPlanRowByType(section, title);

      if (rowIndex === null) {
        // Adding a row is async; wait for the new row to render rather than
        // guessing, otherwise the index would address an existing row and
        // overwrite somebody's real floor-plan data.
        const before = await this.floorPlanRowCount(section);
        await section.getByRole("button", { name: /add floor plan/i }).click();
        const appeared = await waitUntil(
          async () => (await this.floorPlanRowCount(section)) === before + 1,
          config.timeouts.action,
        );
        if (!appeared) throw new Error(`Floor plan row for "${title}" never appeared`);
        rowIndex = before;

        // `type` and `area` are required by the form schema, so the new row is
        // seeded with a derived name and the configured placeholder. Both are
        // meant to be edited by hand afterwards.
        await section.locator(`input[name="floorPlans.${rowIndex}.type"]`).fill(title);
        await section.locator(`input[name="floorPlans.${rowIndex}.area"]`).fill(config.placeholder);
      } else {
        this.log.info(`reusing existing floor plan row "${title}" (#${rowIndex})`);
      }

      const imageField = nthFieldByLabel(this.root, "Floor plan image", rowIndex);
      const library = await this.openPicker(imageField);
      await library.pickOne(file);
      this.log.ok(`${title} ← ${file.fileName}`);
    }
  }

  private floorPlanRowCount(section: Locator): Promise<number> {
    return section.locator("label").filter({ hasText: exact("Floor plan image") }).count();
  }

  /** Index of an existing floor-plan row whose Type matches, so re-runs update in place. */
  private async findFloorPlanRowByType(section: Locator, title: string): Promise<number | null> {
    const count = await this.floorPlanRowCount(section);
    for (let i = 0; i < count; i += 1) {
      const value = await section.locator(`input[name="floorPlans.${i}.type"]`).inputValue().catch(() => "");
      if (value.trim().toLowerCase() === title.toLowerCase()) return i;
    }
    return null;
  }

  /* -------------------------------- repairs -------------------------------- */

  /**
   * The form re-validates the whole record on submit, and the seeded properties
   * carry data the schema rejects — so Save never fires until it is corrected.
   *
   * Two distinct problems, handled differently:
   *  - `seo.ogImage` holds a root-relative `/uploads/...` path but is validated
   *    with a strict URL check. Rewritten to an absolute URL: lossless, and
   *    exactly what the media picker itself stores.
   *  - Required text fields (`area`, `possession`, `bedrooms`, `developer`,
   *    `reraNumber`, floor-plan `area`) are genuinely empty in the database and
   *    are filled with the configured placeholder.
   *
   * Every repair is logged so nothing is changed silently.
   */
  async repairBlockingFields(): Promise<string[]> {
    if (config.repair === "off") return [];
    const repaired: string[] = [];

    const ogImage = this.root.locator('input[name="seo.ogImage"]');
    if ((await ogImage.count()) > 0) {
      const value = (await ogImage.inputValue()).trim();
      if (value.startsWith("/")) {
        await ogImage.fill(`${assetOrigin}${value}`);
        repaired.push(`seo.ogImage → absolute URL (${assetOrigin}${value})`);
      } else if (value !== "" && !/^https?:\/\//i.test(value)) {
        await ogImage.fill("");
        repaired.push(`seo.ogImage → cleared (was not a URL: "${value}")`);
      }
    }

    const errors = await readFieldErrors(this.root);
    for (const error of errors) {
      if (!error.name || error.message.toLowerCase() !== "required") continue;
      const input = this.root.locator(`[name="${error.name}"]`);
      if ((await input.count()) === 0) continue;
      if ((await input.first().inputValue()).trim() !== "") continue;
      await input.first().fill(config.placeholder);
      repaired.push(`${error.name} → "${config.placeholder}" (was empty, required)`);
    }

    for (const message of repaired) this.log.warn(`repaired ${message}`);
    return repaired;
  }

  /* ---------------------------------- save --------------------------------- */

  /**
   * Clicks Save and resolves once the drawer closes (success) or validation
   * messages appear (blocked). Retries once after repairing the fields that
   * blocked the first attempt.
   */
  async save(): Promise<SaveResult> {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      let status: number | undefined;
      const onResponse = (response: { url(): string; status(): number; request(): { method(): string } }) => {
        const isPatch =
          response.request().method() === "PATCH" && /\/properties\/[^/?]+$/.test(new URL(response.url()).pathname);
        if (isPatch) status = response.status();
      };
      this.page.on("response", onResponse);

      await this.footer.getByRole("button", { name: "Save" }).click();

      const settled = await waitUntil(async () => {
        if (status !== undefined) return true;
        if (!(await this.isOpen())) return true;
        return (await this.root.locator("p.text-red-600").count()) > 0;
      }, config.timeouts.save);

      this.page.off("response", onResponse);

      if (status !== undefined && status < 400) {
        await waitUntil(async () => !(await this.isOpen()), config.timeouts.action);
        return { saved: true, status };
      }

      const errors = await readFieldErrors(this.root);
      const blockedBy = errors.map((e) => `${e.label}: ${e.message}`);

      if (!settled && errors.length === 0) {
        return { saved: false, blockedBy: ["Save produced neither a response nor a validation error"] };
      }
      if (status !== undefined && status >= 400) {
        return { saved: false, status, blockedBy: [`API rejected the update (HTTP ${status})`] };
      }
      if (attempt === 1 && config.repair === "on" && errors.length > 0) {
        this.log.warn(`save blocked by: ${blockedBy.join("; ")} — repairing and retrying`);
        await this.repairBlockingFields();
        continue;
      }
      return { saved: false, blockedBy };
    }
    return { saved: false, blockedBy: ["Save did not complete after repair"] };
  }
}
