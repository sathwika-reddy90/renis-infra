import { PrismaClient } from "@prisma/client";
import { isProduction } from "../config/env";

// Singleton PrismaClient — reused across the app and in dev hot-reloads.
// Repositories currently return mock data; this client is ready for wiring later.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProduction ? ["error"] : ["query", "warn", "error"],
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
