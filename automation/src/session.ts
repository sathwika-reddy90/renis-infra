import fs from "node:fs";
import type { Browser, BrowserContext, Page } from "playwright";
import { config } from "./config";
import type { Logger } from "./logger";

/**
 * The login endpoint is rate limited to 10 attempts per 15 minutes, so the
 * session is established once and cached on disk. A cached refresh cookie is
 * reused on the next run; if it no longer works we fall back to a fresh login.
 */
export async function createSession(browser: Browser, log: Logger): Promise<{ context: BrowserContext; page: Page }> {
  const cached = fs.existsSync(config.storageStatePath) ? config.storageStatePath : undefined;

  if (cached) {
    log.step("reusing cached admin session");
    const context = await browser.newContext({ storageState: cached });
    const page = await context.newPage();
    if (await isAuthenticated(page)) {
      log.ok("cached session accepted");
      return { context, page };
    }
    log.warn("cached session expired — signing in again");
    await context.close();
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  await signIn(page, log);
  await context.storageState({ path: config.storageStatePath });
  return { context, page };
}

async function isAuthenticated(page: Page): Promise<boolean> {
  await page.goto(`${config.adminUrl}/admin/properties`, { waitUntil: "domcontentloaded" });
  const table = page.locator("table tbody tr td").first();
  const login = page.locator('input[name="password"]');
  try {
    await Promise.race([
      table.waitFor({ state: "visible", timeout: 20_000 }),
      login.waitFor({ state: "visible", timeout: 20_000 }),
    ]);
  } catch {
    return false;
  }
  return (await table.count()) > 0 && !page.url().includes("/admin/login");
}

async function signIn(page: Page, log: Logger): Promise<void> {
  log.step(`signing in as ${config.email}`);
  await page.goto(`${config.adminUrl}/admin/login`, { waitUntil: "domcontentloaded" });

  // Inputs carry `name` (from react-hook-form register) but no id/htmlFor.
  await page.locator('input[name="email"]').fill(config.email);
  await page.locator('input[name="password"]').fill(config.password);

  const loginResponse = page
    .waitForResponse((r) => r.url().includes("/auth/login"), { timeout: config.timeouts.action })
    .catch(() => null);
  await page.getByRole("button", { name: "Sign In" }).click();

  const response = await loginResponse;
  if (response && response.status() === 429) {
    throw new Error(
      "Login rate limited (10 attempts / 15 min). Wait for the window to reset, or reuse a cached session.",
    );
  }

  // Wait to leave /admin/login rather than for a specific landing route — a
  // forced password change lands somewhere else entirely.
  const left = await page
    .waitForURL((url) => !url.pathname.replace(/\/$/, "").endsWith("/admin/login"), {
      timeout: config.timeouts.action,
    })
    .then(() => true)
    .catch(() => false);

  if (!left) {
    const message = await page.locator("p.text-red-600").first().textContent().catch(() => null);
    throw new Error(`Sign-in failed${message ? `: ${message.trim()}` : ""}`);
  }
  if (await page.getByRole("heading", { name: /set a new password/i }).count()) {
    throw new Error("This account must change its password before the CMS can be used.");
  }
  log.ok("signed in");
}
