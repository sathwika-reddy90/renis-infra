import { prisma } from "../lib/prisma";
import { run } from "../utils/prismaError";

export interface StoredRefreshToken {
  id: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

class RefreshTokenRepository {
  issue(tokenHash: string, userId: string, expiresAt: Date): Promise<StoredRefreshToken> {
    return run("Session", () =>
      prisma.refreshToken.create({
        data: { tokenHash, userId, expiresAt },
        select: { id: true, userId: true, expiresAt: true, revokedAt: true },
      }),
    );
  }

  findByHash(tokenHash: string): Promise<StoredRefreshToken | null> {
    return run("Session", () =>
      prisma.refreshToken.findUnique({
        where: { tokenHash },
        select: { id: true, userId: true, expiresAt: true, revokedAt: true },
      }),
    );
  }

  async revoke(id: string): Promise<void> {
    await run("Session", () =>
      prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } }),
    );
  }

  /** Revokes every active session for a user (used on logout-all / compromise). */
  async revokeAllForUser(userId: string): Promise<void> {
    await run("Session", () =>
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    );
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
