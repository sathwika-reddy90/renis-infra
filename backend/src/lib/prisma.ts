import { PrismaClient } from "@prisma/client";
import { env, isProduction } from "../config/env";

// The Supabase session pooler allows at most 15 client sessions per
// user/database, shared by every process that connects (Railway, local dev,
// scripts). Prisma's default pool sizes itself to num_cpus * 2 + 1, which on
// Railway hardware alone exceeds 15 — each connection past the cap is
// rejected with EMAXCONNSESSION and surfaces as a 500 under concurrency.
// Cap the pool explicitly unless the URL already sets one.
function withConnectionLimit(url: string | undefined): string | undefined {
  if (!url || url.includes("connection_limit=")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connection_limit=5&pool_timeout=20`;
}

// Singleton PrismaClient — reused across the app and in dev hot-reloads.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: withConnectionLimit(env.DATABASE_URL),
    log: isProduction ? ["error"] : ["query", "warn", "error"],
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
