import fs from "node:fs";
import path from "node:path";

export type Slot = "featured" | "hero" | "gallery" | "masterPlan" | "floorPlan" | "developerLogo";

export interface ImageFile {
  slot: Slot;
  /** 1-based position within a numbered slot (hero-2 -> 2). `1` for singletons. */
  index: number;
  absolutePath: string;
  /** Original name on disk, e.g. `hero-2.jpg`. */
  fileName: string;
  /** Globally unique name used when uploading, e.g. `one-by-msn__hero-2.jpg`. */
  uploadName: string;
  mimeType: string;
}

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

/** `<slot>` or `<slot>-<n>`, extension-agnostic — folders mix jpg/jpeg/png/webp/svg. */
const PATTERNS: { slot: Slot; re: RegExp }[] = [
  { slot: "featured", re: /^featured$/ },
  { slot: "hero", re: /^hero-(\d+)$/ },
  { slot: "gallery", re: /^gallery-(\d+)$/ },
  { slot: "masterPlan", re: /^master-plan$/ },
  { slot: "floorPlan", re: /^floor-plan-(\d+)$/ },
  { slot: "developerLogo", re: /^developer-logo$/ },
];

export interface ProjectFiles {
  folder: string;
  slug: string;
  featured?: ImageFile;
  masterPlan?: ImageFile;
  developerLogo?: ImageFile;
  hero: ImageFile[];
  gallery: ImageFile[];
  floorPlans: ImageFile[];
  /** Files in the folder that matched no known slot. */
  unmatched: string[];
  get total(): number;
}

/** Reads one project folder and buckets its images by slot, sorted by index. */
export function readProjectFiles(root: string, folder: string, slug: string): ProjectFiles {
  const dir = path.join(root, folder);
  const entries = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => !f.startsWith("."))
    : [];

  const hero: ImageFile[] = [];
  const gallery: ImageFile[] = [];
  const floorPlans: ImageFile[] = [];
  const unmatched: string[] = [];
  let featured: ImageFile | undefined;
  let masterPlan: ImageFile | undefined;
  let developerLogo: ImageFile | undefined;

  for (const fileName of entries) {
    const ext = path.extname(fileName).toLowerCase();
    const base = path.basename(fileName, ext);
    const mimeType = MIME_BY_EXT[ext];

    const match = PATTERNS.map((p) => ({ p, m: base.match(p.re) })).find((x) => x.m);
    if (!match || !mimeType) {
      unmatched.push(fileName);
      continue;
    }

    const file: ImageFile = {
      slot: match.p.slot,
      index: match.m![1] ? Number(match.m![1]) : 1,
      absolutePath: path.join(dir, fileName),
      fileName,
      uploadName: `${slug}__${fileName}`,
      mimeType,
    };

    if (file.slot === "featured") featured = file;
    else if (file.slot === "masterPlan") masterPlan = file;
    else if (file.slot === "developerLogo") developerLogo = file;
    else if (file.slot === "hero") hero.push(file);
    else if (file.slot === "gallery") gallery.push(file);
    else floorPlans.push(file);
  }

  const byIndex = (a: ImageFile, b: ImageFile) => a.index - b.index;
  hero.sort(byIndex);
  gallery.sort(byIndex);
  floorPlans.sort(byIndex);

  return {
    folder,
    slug,
    featured,
    masterPlan,
    developerLogo,
    hero,
    gallery,
    floorPlans,
    unmatched,
    get total() {
      return (
        (featured ? 1 : 0) +
        (masterPlan ? 1 : 0) +
        (developerLogo ? 1 : 0) +
        hero.length +
        gallery.length +
        floorPlans.length
      );
    },
  };
}

/** Project folders present under `root`, in directory order. */
export function listProjectFolders(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
}

export const readBuffer = (file: ImageFile): Buffer => fs.readFileSync(file.absolutePath);
