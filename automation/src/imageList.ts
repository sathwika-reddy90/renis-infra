import fs from "node:fs";

export interface ListEntry {
  /** Project folder, e.g. `meenakshi-elan`. */
  folder: string;
  /** Target file name, e.g. `gallery-4.jpg`. */
  fileName: string;
  url: string;
}

/**
 * Parses `image-list.txt` — one `folder/filename.ext|URL` per line, blanks and
 * `#` comments ignored.
 */
export function parseImageList(filePath: string): ListEntry[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Image list not found: ${filePath}`);
  }

  const entries: ListEntry[] = [];
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) return;

    const separator = line.indexOf("|");
    if (separator === -1) throw new Error(`${filePath}:${i + 1} — missing "|" separator`);

    const target = line.slice(0, separator).trim();
    const url = line.slice(separator + 1).trim();

    const slash = target.indexOf("/");
    if (slash === -1) throw new Error(`${filePath}:${i + 1} — target must be "folder/filename"`);

    entries.push({
      folder: target.slice(0, slash),
      fileName: target.slice(slash + 1),
      url,
    });
  });

  return entries;
}

export function groupByFolder(entries: ListEntry[]): Map<string, ListEntry[]> {
  const grouped = new Map<string, ListEntry[]>();
  for (const entry of entries) {
    const list = grouped.get(entry.folder) ?? [];
    list.push(entry);
    grouped.set(entry.folder, list);
  }
  return grouped;
}
