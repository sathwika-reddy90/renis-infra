import { userRepository, type UserRecord } from "../repositories/user.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  signAccessToken,
  createRefreshToken,
  hashRefreshToken,
  refreshExpiryDate,
} from "../utils/tokens";
import { ApiError } from "../utils/ApiError";
import type { AuthUser, ChangePasswordInput, LoginInput } from "../types/auth";

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

function toAuthUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
}

/** Issues a fresh access token + a new opaque refresh token (persisted hashed). */
async function issueSession(user: UserRecord): Promise<AuthResult> {
  const authUser = toAuthUser(user);
  const { raw, hash } = createRefreshToken();
  await refreshTokenRepository.issue(hash, user.id, refreshExpiryDate());
  return { user: authUser, accessToken: signAccessToken(authUser), refreshToken: raw };
}

class AuthService {
  async login({ email, password }: LoginInput): Promise<AuthResult> {
    const user = await userRepository.findByEmail(email);
    // Uniform error to avoid leaking which accounts exist.
    const invalid = ApiError.unauthorized("Invalid email or password");
    if (!user || !user.isActive) throw invalid;

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw invalid;

    await userRepository.markLogin(user.id);
    return issueSession(user);
  }

  /** Validates + rotates a refresh token, returning a brand-new session. */
  async refresh(rawToken: string | undefined): Promise<AuthResult> {
    if (!rawToken) throw ApiError.unauthorized("Missing refresh token");

    const stored = await refreshTokenRepository.findByHash(hashRefreshToken(rawToken));
    if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
      throw ApiError.unauthorized("Session expired, please sign in again");
    }

    const user = await userRepository.findById(stored.userId);
    if (!user || !user.isActive) throw ApiError.unauthorized("Account is no longer active");

    // Rotation: old token can never be replayed.
    await refreshTokenRepository.revoke(stored.id);
    return issueSession(user);
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const stored = await refreshTokenRepository.findByHash(hashRefreshToken(rawToken));
    if (stored && !stored.revokedAt) await refreshTokenRepository.revoke(stored.id);
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) throw ApiError.unauthorized("Account is no longer active");
    return toAuthUser(user);
  }

  /** Changes the password, clears the must-change flag, and rotates sessions. */
  async changePassword(userId: string, input: ChangePasswordInput): Promise<AuthResult> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.unauthorized("Account not found");

    const ok = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!ok) throw ApiError.badRequest("Current password is incorrect");

    await userRepository.updatePassword(user.id, await hashPassword(input.newPassword));
    // Invalidate all existing sessions, then start a clean one.
    await refreshTokenRepository.revokeAllForUser(user.id);

    const updated = await userRepository.findById(user.id);
    if (!updated) throw ApiError.internal("Failed to load updated account");
    return issueSession(updated);
  }
}

export const authService = new AuthService();
