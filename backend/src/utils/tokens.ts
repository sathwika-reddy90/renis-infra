import { randomBytes, createHash } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "./ApiError";
import type { AuthUser, Role } from "../types/auth";

interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  mcp: boolean; // mustChangePassword
}

/** Signs a short-lived stateless access token. */
export function signAccessToken(user: AuthUser): string {
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mcp: user.mustChangePassword,
  };
  const options: SignOptions = { expiresIn: env.ACCESS_TOKEN_TTL as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

/** Verifies an access token and returns the principal, or throws 401. */
export function verifyAccessToken(token: string): AuthUser {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      mustChangePassword: decoded.mcp,
    };
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
}

/** Opaque refresh token: a raw secret for the cookie + its hash for storage. */
export function createRefreshToken(): { raw: string; hash: string } {
  const raw = randomBytes(48).toString("hex");
  return { raw, hash: hashRefreshToken(raw) };
}

export function hashRefreshToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function refreshExpiryDate(): Date {
  return new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}
