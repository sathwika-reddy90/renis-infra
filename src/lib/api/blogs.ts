import { apiClient } from "./client";
import { type ApiBlog, toBlogPost } from "./dto";
import type { BlogPost } from "@/types/blog";

export async function fetchBlogs(signal?: AbortSignal): Promise<BlogPost[]> {
  const data = await apiClient.get<ApiBlog[]>("/blogs", signal);
  return data.map(toBlogPost);
}
