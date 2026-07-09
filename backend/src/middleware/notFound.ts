import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

/** Converts unmatched routes into a 404 that flows to the error handler. */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
