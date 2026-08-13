import { isProduction } from "../config/env";
import { LocalStorageProvider } from "./LocalStorageProvider";
import { SupabaseStorageProvider } from "./SupabaseStorageProvider";
import type { StorageProvider } from "./StorageProvider";

export const storageProvider: StorageProvider = isProduction
  ? new SupabaseStorageProvider()
  : new LocalStorageProvider();

export type { StorageProvider, StoredFile, StoredFileInput } from "./StorageProvider";
