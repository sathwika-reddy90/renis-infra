/** A file ready to be persisted by a storage provider. */
export interface StoredFileInput {
  /** Desired storage key (path relative to the provider's root), e.g. "2026/07/abc123.jpg". */
  key: string;
  buffer: Buffer;
  mimeType: string;
}

export interface StoredFile {
  key: string;
  /** Publicly reachable URL for the stored file. */
  url: string;
}

/**
 * Abstraction over "where uploaded files physically live". Swapping to S3 (or
 * any other backend) later only requires a new implementation of this
 * interface — no application code depends on the storage mechanics.
 */
export interface StorageProvider {
  readonly name: string;
  save(input: StoredFileInput): Promise<StoredFile>;
  /** Reads back a previously stored file's bytes (used for thumbnail generation). */
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  /** Renames/moves a key, returning the new public URL. */
  move(fromKey: string, toKey: string): Promise<StoredFile>;
  urlFor(key: string): string;
}
