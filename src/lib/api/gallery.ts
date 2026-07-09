import { apiClient } from "./client";
import { type ApiGalleryImage, toGalleryImage } from "./dto";
import type { GalleryImage } from "@/types/gallery";

export async function fetchGallery(signal?: AbortSignal): Promise<GalleryImage[]> {
  const data = await apiClient.get<ApiGalleryImage[]>("/gallery", signal);
  return data.map(toGalleryImage);
}
