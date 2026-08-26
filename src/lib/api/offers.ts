import { apiClient } from "./client";
import { type ApiOffer, toOffer } from "./dto";
import type { Offer } from "@/types/offer";

export async function fetchOffers(signal?: AbortSignal): Promise<Offer[]> {
  const data = await apiClient.get<ApiOffer[]>("/offers", signal);
  return data.map(toOffer);
}
