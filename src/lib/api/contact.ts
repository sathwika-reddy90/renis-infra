import { apiClient } from "./client";

export interface InquiryInput {
  name: string;
  email: string;
  phone: string;
  message?: string;
  interest?: string;
  /** Preferred visit slot ("Schedule a Visit" submissions). */
  visitDate?: string;
  visitTime?: string;
}

export interface InquiryResult {
  id: string;
  createdAt: string;
}

export async function submitInquiry(input: InquiryInput): Promise<InquiryResult> {
  return apiClient.post<InquiryResult>("/contact", input);
}
