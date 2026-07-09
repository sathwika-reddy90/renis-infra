import type { Request, RequestHandler } from "express";
import { verifyAccessToken } from "../utils/tokens";
import { ApiError } from "../utils/ApiError";
import type { AuthUser } from "../types/auth";

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

/** Verifies the access token and attaches the principal to `req.user`. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const token = extractBearer(req);
  if (!token) {
    next(ApiError.unauthorized("Authentication required"));
    return;
  }
  req.user = verifyAccessToken(token);
  next();
};

/** Typed accessor for the authenticated user (throws if the guard was skipped). */
export function currentUser(req: Request): AuthUser {
  if (!req.user) throw ApiError.unauthorized("Authentication required");
  return req.user;
}
