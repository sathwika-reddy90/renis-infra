import { Prisma, type User as UserRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { run } from "../utils/prismaError";
import type { Role } from "../types/auth";

/** Full user record including the password hash — never leaves the service layer. */
export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
}

function toRecord(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
    role: row.role,
    isActive: row.isActive,
    mustChangePassword: row.mustChangePassword,
  };
}

/** Minimal directory entry — safe to expose (no password hash). */
export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
}

class UserRepository {
  /** Active users, for populating "assign to" pickers. */
  async listActive(): Promise<UserSummary[]> {
    const rows = await run("User", () =>
      prisma.user.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true, role: true },
      }),
    );
    return rows;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const row = await run("User", () =>
      prisma.user.findUnique({ where: { email: email.toLowerCase() } }),
    );
    return row ? toRecord(row) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const row = await run("User", () => prisma.user.findUnique({ where: { id } }));
    return row ? toRecord(row) : null;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await run("User", () =>
      prisma.user.update({
        where: { id },
        data: { passwordHash, mustChangePassword: false },
      }),
    );
  }

  async markLogin(id: string): Promise<void> {
    await run("User", () =>
      prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } }),
    );
  }

  create(data: Prisma.UserUncheckedCreateInput): Promise<UserRow> {
    return run("User", () => prisma.user.create({ data }));
  }
}

export const userRepository = new UserRepository();
