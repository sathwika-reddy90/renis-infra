import type { CookieOptions, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { currentUser } from "../middleware/authenticate";
import { env, isProduction } from "../config/env";
import type { ChangePasswordInput, LoginInput } from "../types/auth";

// Refresh cookie is scoped to the auth path so it never rides along CRUD calls.
const COOKIE_PATH = "/api/auth";

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    // The admin frontend (Vercel) and this API (Railway) are cross-site, and
    // browsers never attach SameSite=Lax cookies to cross-site fetches — the
    // refresh flow silently breaks. "None" (which requires Secure) is the only
    // value that works cross-site; keep "lax" for same-site local dev, where
    // Secure cookies would be dropped over http.
    sameSite: isProduction ? "none" : "lax",
    path: COOKIE_PATH,
    domain: env.COOKIE_DOMAIN,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(env.REFRESH_COOKIE_NAME, token, cookieOptions());
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(env.REFRESH_COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
}

export const authController = {
  login: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body as LoginInput);
    setRefreshCookie(res, refreshToken);
    res.json(ApiResponse.ok({ user, accessToken }, "Signed in"));
  }),

  refresh: asyncHandler(async (req, res) => {
    const raw = req.cookies?.[env.REFRESH_COOKIE_NAME] as string | undefined;
    const { user, accessToken, refreshToken } = await authService.refresh(raw);
    setRefreshCookie(res, refreshToken);
    res.json(ApiResponse.ok({ user, accessToken }));
  }),

  logout: asyncHandler(async (req, res) => {
    const raw = req.cookies?.[env.REFRESH_COOKIE_NAME] as string | undefined;
    await authService.logout(raw);
    clearRefreshCookie(res);
    res.json(ApiResponse.ok({ success: true }, "Signed out"));
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.me(currentUser(req).id);
    res.json(ApiResponse.ok({ user }));
  }),

  changePassword: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.changePassword(
      currentUser(req).id,
      req.body as ChangePasswordInput,
    );
    setRefreshCookie(res, refreshToken);
    res.json(ApiResponse.ok({ user, accessToken }, "Password updated"));
  }),
};
