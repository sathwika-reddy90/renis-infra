import { Prisma, type TeamMember as TeamRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { PrismaRepository } from "./prisma.repository";
import { opt } from "../utils/optional";
import type { PageArgs } from "../utils/pagination";
import type { TeamMember, TeamCreateInput, TeamUpdateInput } from "../types/team";

class TeamRepository extends PrismaRepository<TeamRow, TeamMember, TeamCreateInput, TeamUpdateInput> {
  protected readonly resource = "Team member";

  protected toDto(row: TeamRow): TeamMember {
    return {
      id: row.id,
      name: row.name,
      role: row.role,
      image: row.image,
      bio: opt(row.bio),
      linkedin: opt(row.linkedin),
      twitter: opt(row.twitter),
      email: opt(row.email),
      order: row.order,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  protected queryMany(args: PageArgs): Promise<TeamRow[]> {
    return prisma.teamMember.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip: args.skip,
      take: args.take,
    });
  }

  protected queryOne(id: string): Promise<TeamRow | null> {
    return prisma.teamMember.findUnique({ where: { id } });
  }

  protected insert(data: TeamCreateInput): Promise<TeamRow> {
    const create: Prisma.TeamMemberCreateInput = {
      name: data.name,
      role: data.role,
      image: data.image,
      bio: data.bio,
      linkedin: data.linkedin,
      twitter: data.twitter,
      email: data.email,
      order: data.order,
    };
    return prisma.teamMember.create({ data: create });
  }

  protected change(id: string, data: TeamUpdateInput): Promise<TeamRow> {
    const update: Prisma.TeamMemberUpdateInput = {
      name: data.name,
      role: data.role,
      image: data.image,
      bio: data.bio,
      linkedin: data.linkedin,
      twitter: data.twitter,
      email: data.email,
      order: data.order,
    };
    return prisma.teamMember.update({ where: { id }, data: update });
  }

  protected async remove(id: string): Promise<void> {
    await prisma.teamMember.delete({ where: { id } });
  }
}

export const teamRepository = new TeamRepository();
