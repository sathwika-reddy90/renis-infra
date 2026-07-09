import fs from "node:fs/promises";
import path from "node:path";
import { env, publicAssetBaseUrl } from "../config/env";
import type { StorageProvider, StoredFile, StoredFileInput } from "./StorageProvider";

/** Stores files on local disk under `env.UPLOAD_DIR`, served via `/uploads`. */
export class LocalStorageProvider implements StorageProvider {
  readonly name = "local";
  private readonly root = path.resolve(process.cwd(), env.UPLOAD_DIR);

  private absolutePath(key: string): string {
    const resolved = path.resolve(this.root, key);
    if (!resolved.startsWith(this.root)) {
      throw new Error("Invalid storage key");
    }
    return resolved;
  }

  urlFor(key: string): string {
    return `${publicAssetBaseUrl}/uploads/${key}`;
  }

  async save({ key, buffer }: StoredFileInput): Promise<StoredFile> {
    const target = this.absolutePath(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, buffer);
    return { key, url: this.urlFor(key) };
  }

  read(key: string): Promise<Buffer> {
    return fs.readFile(this.absolutePath(key));
  }

  async delete(key: string): Promise<void> {
    await fs.rm(this.absolutePath(key), { force: true });
  }

  async move(fromKey: string, toKey: string): Promise<StoredFile> {
    const from = this.absolutePath(fromKey);
    const to = this.absolutePath(toKey);
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.rename(from, to);
    return { key: toKey, url: this.urlFor(toKey) };
  }
}
