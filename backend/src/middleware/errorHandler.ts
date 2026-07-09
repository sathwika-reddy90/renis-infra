import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { logger } from "../utils/logger";
import { isProduction } from "../config/env";

/** Central error handler. Must keep the 4-arg signature Express expects. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(ApiResponse.fail(err.message, err.details));
    return;
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  logger.error("Unhandled error", err);

  res
    .status(500)
    .json(ApiResponse.fail("Internal Server Error", isProduction ? undefined : message));
}
