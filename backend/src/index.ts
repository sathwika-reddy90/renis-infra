import type { Server } from "node:http";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { prisma } from "./lib/prisma";

const app = createApp();
const server: Server = app.listen(env.PORT, () => {
  logger.info(`RENISINFRA API listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});

/** Close HTTP server and DB connection, then exit. */
async function shutdown(signal: string): Promise<void> {
  logger.warn(`Received ${signal}, shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async () => {
    try {
      await prisma.$disconnect();
      logger.info("Server closed. Bye.");
      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown", error);
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", error);
  process.exit(1);
});
