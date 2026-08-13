import os from "node:os";
import path from "node:path";

/**
 * Every knob the run needs, resolved from env with sensible local defaults so
 * the script works out of the box against `npm run dev` + `backend npm run dev`.
 */
export const config = {
  adminUrl: process.env.ADMIN_URL ?? "http://localhost:3000",
  /** Used to detect upload/save API calls and to absolutise relative media paths. */
  apiUrl: process.env.API_URL ?? "http://localhost:4000/api",

  email: process.env.ADMIN_EMAIL ?? "admin@renisinfra.com",
  password: process.env.ADMIN_PASSWORD ?? "ChangeMe123!",

  imagesRoot:
    process.env.IMAGES_ROOT ?? path.join(os.homedir(), "Documents/RENIS-Images/RENIS-Images"),

  /** `folder/filename|URL` manifest used by the downloader. */
  imageList: process.env.IMAGE_LIST ?? path.join(os.homedir(), "Documents/RENIS-Images/image-list.txt"),

  /** Re-download files that already exist on disk. */
  forceDownload: process.env.FORCE_DOWNLOAD === "1",

  /** Reused between runs so repeated runs don't burn the 10-per-15-min login limit. */
  storageStatePath: process.env.STORAGE_STATE ?? path.join(process.cwd(), ".auth-state.json"),

  headless: process.env.HEADED !== "1",
  slowMo: Number(process.env.SLOW_MO ?? 0),

  /** Attempts per upload slot before the slot is recorded as failed. */
  uploadRetries: Number(process.env.UPLOAD_RETRIES ?? 3),

  /**
   * Hero/gallery lists append by default and de-duplicate on URL, which makes
   * re-runs idempotent. `REPLACE_LISTS=1` clears the existing entries first so
   * the saved list is exactly what the folder contains.
   */
  replaceLists: process.env.REPLACE_LISTS === "1",

  /** `DRY_RUN=1` walks every step but closes the drawer instead of saving. */
  dryRun: process.env.DRY_RUN === "1",

  /**
   * The property form validates with zod on submit and several seeded records
   * fail it before Save can fire. Empty *required* text fields are filled with
   * this placeholder so the media work can be saved. Set `REPAIR=off` to skip
   * repairs entirely and report those properties as failed instead.
   */
  repair: (process.env.REPAIR ?? "on") as "on" | "off",
  placeholder: process.env.PLACEHOLDER ?? "Not Specified",

  timeouts: {
    action: 30_000,
    upload: 120_000,
    save: 30_000,
  },
} as const;

/** Origin that serves `/uploads/...` (i.e. the API host without the `/api` suffix). */
export const assetOrigin = config.apiUrl.replace(/\/api\/?$/, "");

/**
 * CMS folder name -> property slug. Folders whose name already equals the slug
 * need no entry; these two diverge.
 */
export const SLUG_OVERRIDES: Record<string, string> = {
  "meenakshi-elan": "elan-by-meenakshi",
  "anvita-high9": "high-9",
};

export const slugForFolder = (folder: string): string => SLUG_OVERRIDES[folder] ?? folder;
