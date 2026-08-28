import { env, isProduction } from "../config/env";
import { logger } from "../utils/logger";
import { LocalStorageProvider } from "./LocalStorageProvider";
import { SupabaseStorageProvider } from "./SupabaseStorageProvider";
import type { StorageProvider } from "./StorageProvider";

/*
 * Storage is chosen by whether Supabase is configured — NOT by NODE_ENV.
 *
 * Keying this off `isProduction` meant a locally-run backend wrote uploads to
 * its own disk and stored `http://localhost:4000/uploads/...` URLs. Because
 * local development points at the *production* database, those unreachable
 * URLs landed on live records and rendered as broken images for everyone.
 *
 * With credentials present, every upload — local or deployed — goes to the
 * same Supabase bucket, so the URL written to the database is always publicly
 * reachable. Local disk remains only as the fallback for a machine with no
 * Supabase credentials (offline work against a local database).
 */
const supabaseConfigured = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

if (isProduction && !supabaseConfigured) {
  // Never let a deployed instance silently fall back to ephemeral local disk.
  console.error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in production for media storage.",
  );
  process.exit(1);
}

export const storageProvider: StorageProvider = supabaseConfigured
  ? new SupabaseStorageProvider()
  : new LocalStorageProvider();

if (!supabaseConfigured) {
  logger.warn(
    "[storage] Supabase is not configured — uploads will be written to local disk and " +
      "their URLs will not be reachable from a deployed site. Set SUPABASE_URL and " +
      "SUPABASE_SERVICE_ROLE_KEY to store uploads in Supabase.",
  );
}

logger.info(`[storage] Using "${storageProvider.name}" storage provider.`);

export type { StorageProvider, StoredFile, StoredFileInput } from "./StorageProvider";
