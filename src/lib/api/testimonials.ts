import { apiClient } from "./client";
import { type ApiTestimonial, toTestimonial } from "./dto";
import type { Testimonial } from "@/types/testimonial";

export async function fetchTestimonials(signal?: AbortSignal): Promise<Testimonial[]> {
  const data = await apiClient.get<ApiTestimonial[]>("/testimonials", signal);
  return data.map(toTestimonial);
}
