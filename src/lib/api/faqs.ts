import { apiClient } from "./client";
import { type ApiFaq, toFaq } from "./dto";
import type { FAQ } from "@/types/faq";

export async function fetchFaqs(signal?: AbortSignal): Promise<FAQ[]> {
  const data = await apiClient.get<ApiFaq[]>("/faqs", signal);
  return data.map(toFaq);
}
