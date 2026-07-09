import { apiClient } from "./client";
import { type ApiProperty, toProject, toProperty } from "./dto";
import type { Project } from "@/types/project";
import type { Property } from "@/types/property";

export async function fetchProjects(signal?: AbortSignal): Promise<Project[]> {
  const data = await apiClient.get<ApiProperty[]>("/properties", signal);
  return data.map(toProject);
}

export async function fetchProperties(signal?: AbortSignal): Promise<Property[]> {
  const data = await apiClient.get<ApiProperty[]>("/properties", signal);
  return data.map(toProperty);
}

// No slug endpoint on the backend — resolve from the list.
export async function fetchPropertyBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<Property | null> {
  const data = await apiClient.get<ApiProperty[]>("/properties", signal);
  const match = data.find((p) => p.slug === slug);
  return match ? toProperty(match) : null;
}
