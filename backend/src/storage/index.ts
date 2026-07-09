import { LocalStorageProvider } from "./LocalStorageProvider";
import type { StorageProvider } from "./StorageProvider";

// Single place that decides which provider backs uploads. Adding S3 later
// means adding an `S3StorageProvider` and switching this export — nothing
// else in the app touches storage mechanics directly.
export const storageProvider: StorageProvider = new LocalStorageProvider();

export type { StorageProvider, StoredFile, StoredFileInput } from "./StorageProvider";
