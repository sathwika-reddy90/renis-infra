import path from "node:path";
import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import { corsOrigins, env } from "./config/env";
import { requestLogger } from "./middleware/requestLogger";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { apiRouter } from "./routes";
import { ApiResponse } from "./utils/ApiResponse";

export function createApp(): Application {
  const app = express();

  // Security & performance middleware.
  app.use(helmet());
  // `credentials: true` is required so the browser sends the HttpOnly refresh
  // cookie; a reflected allow-list origin (not "*") is required alongside credentials.
  const corsOptions: cors.CorsOptions = { origin: corsOrigins, credentials: true };
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(compression());

  // Body & cookie parsing.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Serve uploaded media (local storage provider only).
  app.use("/uploads", express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

  // Observability.
  app.use(requestLogger);

  // Health check.
  app.get("/health", (_req: Request, res: Response) => {
    res.json(
      ApiResponse.ok({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      }),
    );
  });

  // API.
  app.use("/api", apiRouter);

  // 404 + centralized error handling (must be last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
