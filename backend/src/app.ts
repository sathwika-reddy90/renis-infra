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

  // Behind Railway's reverse proxy: trust the first X-Forwarded-* hop so
  // req.ip is the real client address. Without this, every visitor shares the
  // proxy's IP and the login rate limiter becomes one global bucket, locking
  // out all devices at once.
  app.set("trust proxy", 1);

  // Security & performance middleware.
  app.use(helmet());
  // `credentials: true` is required so the browser sends the HttpOnly refresh
  // cookie; a reflected allow-list origin (not "*") is required alongside credentials.
  // Vercel preview deployments get a fresh origin per deploy
  // (renis-infra-<hash>-sathwika-reddy90s-projects.vercel.app), so they can't
  // live in the static CORS_ORIGIN list — match them by pattern instead, or
  // every API call from a preview build fails and its pages render as errors.
  const VERCEL_PREVIEW_ORIGIN =
    /^https:\/\/renis-infra-[a-z0-9-]+-sathwika-reddy90s-projects\.vercel\.app$/;
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      const allowed =
        !origin || corsOrigins.includes(origin) || VERCEL_PREVIEW_ORIGIN.test(origin);
      callback(null, allowed);
    },
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(compression());

  // Body & cookie parsing.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Serve uploaded media (local storage provider only). These files are
  // embedded cross-origin by the Next.js frontend (a different origin from
  // this API in both dev and prod), so relax helmet's global same-origin
  // Cross-Origin-Resource-Policy just for this route — otherwise browsers
  // silently block <img> loads of locally-stored uploads (broken-image icon,
  // no console/network error surfaced on the request itself) while
  // Supabase-hosted uploads, served from a separate origin that doesn't send
  // that header, load fine.
  app.use(
    "/uploads",
    helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
    express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)),
  );

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
