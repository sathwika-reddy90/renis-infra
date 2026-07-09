import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@localhost:5432/renisinfra?schema=public"),

  // Auth — override these secrets in production.
  JWT_ACCESS_SECRET: z.string().min(1).default("dev-access-secret-change-in-production"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  REFRESH_COOKIE_NAME: z.string().default("renis_refresh"),
  COOKIE_DOMAIN: z.string().optional(),

  // Media storage — local disk today; swappable via StorageProvider later.
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().int().positive().default(15),
  PUBLIC_ASSET_BASE_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast on misconfiguration.
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";

if (isProduction && env.JWT_ACCESS_SECRET === "dev-access-secret-change-in-production") {
  console.error("JWT_ACCESS_SECRET must be set in production.");
  process.exit(1);
}

if (isProduction && !env.CORS_ORIGIN) {
  console.error(
    "CORS_ORIGIN must be set in production (comma-separated list of allowed origins).",
  );
  process.exit(1);
}

const DEFAULT_DEV_CORS_ORIGIN = "http://localhost:3000";

/** Parsed list of allowed CORS origins (comma-separated). Never "*" alongside credentials. */
export const corsOrigins: string[] = (env.CORS_ORIGIN ?? DEFAULT_DEV_CORS_ORIGIN)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

console.log(`[cors] Allowed origins: ${corsOrigins.join(", ")}`);

/** Absolute origin used to build publicly reachable media URLs. */
export const publicAssetBaseUrl = env.PUBLIC_ASSET_BASE_URL ?? `http://localhost:${env.PORT}`;
