import type { Locator, Page } from "playwright";

/**
 * Locator helpers for the RENISINFRA admin.
 *
 * The admin's form fields render `<label>` without `htmlFor` and inputs without
 * `id`, so `getByLabel` cannot be used. Instead we find the label by its text
 * and climb one level to the `FieldShell` wrapper that holds the control. That
 * keeps the automation off Tailwind class names, which are the volatile part of
 * this codebase.
 *
 * Labels are uppercased with CSS only, so every text matcher is case-insensitive.
 */

/** Anchored, case-insensitive matcher for an exact visible string. */
export const exact = (text: string): RegExp =>
  new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i");

/** The `FieldShell` wrapper for a labelled control inside `scope`. */
export const fieldByLabel = (scope: Locator, label: string): Locator =>
  scope.locator("label").filter({ hasText: exact(label) }).locator("xpath=..");

/** The nth `FieldShell` for a label that repeats (e.g. one per floor-plan row). */
export const nthFieldByLabel = (scope: Locator, label: string, index: number): Locator =>
  scope.locator("label").filter({ hasText: exact(label) }).nth(index).locator("xpath=..");

/** A `FormSection` located by its heading text. */
export const sectionByHeading = (scope: Locator, heading: string): Locator =>
  scope.locator("h3").filter({ hasText: exact(heading) }).locator("xpath=..");

/** The edit/create slide-over. */
export const drawer = (page: Page): Locator => page.locator("aside");

/**
 * The Media Library modal panel. The modal has no ARIA dialog role, so it is
 * identified as the innermost element containing both its heading and its
 * Upload button — no class names involved.
 */
export const mediaDialog = (page: Page): Locator =>
  page
    .locator("div")
    .filter({ has: page.getByRole("heading", { name: "Media Library" }) })
    .filter({ has: page.getByRole("button", { name: "Upload", exact: true }) })
    .last();

/** A media card in the library grid, found by the exact file name it displays. */
export const mediaCard = (dialog: Locator, fileName: string): Locator =>
  dialog.locator(`p[title="${cssEscape(fileName)}"]`).locator("xpath=../..");

const cssEscape = (v: string) => v.replace(/["\\]/g, "\\$&");

/** Rows of the properties table. */
export const tableRows = (page: Page): Locator => page.locator("table tbody tr");

/** Validation messages currently rendered inside the drawer, paired with their field. */
export async function readFieldErrors(
  scope: Locator,
): Promise<{ label: string; message: string; name: string | null }[]> {
  return scope.locator("p.text-red-600").evaluateAll((nodes) =>
    nodes.map((node) => {
      const shell = node.parentElement;
      return {
        label: shell?.querySelector("label")?.textContent?.trim() ?? "(unknown field)",
        message: node.textContent?.trim() ?? "",
        name: shell?.querySelector("input, textarea")?.getAttribute("name") ?? null,
      };
    }),
  );
}

/** Polls `predicate` until true or `timeout` elapses. Returns whether it became true. */
export async function waitUntil(
  predicate: () => Promise<boolean>,
  timeout: number,
  interval = 250,
): Promise<boolean> {
  const deadline = Date.now() + timeout;
  for (;;) {
    if (await predicate()) return true;
    if (Date.now() >= deadline) return false;
    await new Promise((r) => setTimeout(r, interval));
  }
}
