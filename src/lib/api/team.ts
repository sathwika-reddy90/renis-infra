import { apiClient } from "./client";
import { type ApiTeamMember, toTeamMember } from "./dto";
import type { TeamMember } from "@/types/team";

export async function fetchTeam(signal?: AbortSignal): Promise<TeamMember[]> {
  const data = await apiClient.get<ApiTeamMember[]>("/team", signal);
  return data.map(toTeamMember);
}
