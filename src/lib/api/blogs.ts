import { apiClient } from "./client";
import { type ApiBlog, toBlogPost } from "./dto";
import type { BlogPost } from "@/types/blog";

export async function fetchBlogs(signal?: AbortSignal): Promise<BlogPost[]> {
  const data = await apiClient.get<ApiBlog[]>("/blogs", signal);
  return data.map(toBlogPost);
}

// No slug endpoint on the backend — resolve from the list, same approach
// as fetchPropertyBySlug.
export async function fetchBlogBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<BlogPost | null> {
  const data = await apiClient.get<ApiBlog[]>("/blogs", signal);
  const match = data.find((b) => b.slug === slug);
  return match ? toBlogPost(match) : null;
}
