import { apiClient } from "./client";
import { type ApiAmenity, toAmenity } from "./dto";
import type { Amenity } from "@/types/amenity";

export async function fetchAmenities(signal?: AbortSignal): Promise<Amenity[]> {
  const data = await apiClient.get<ApiAmenity[]>("/amenities", signal);
  return data.map(toAmenity);
}
