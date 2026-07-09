import { inquiryRepository } from "../repositories/inquiry.repository";
import { ApiError } from "../utils/ApiError";
import type {
  Inquiry,
  InquiryCreateInput,
  InquiryStatusHistoryEntry,
  InquiryUpdateInput,
} from "../types/inquiry";

/**
 * Bespoke (not generic BaseService) because lead updates need the acting
 * user's id to record a status-change timeline entry.
 */
class InquiryService {
  list(): Promise<Inquiry[]> {
    return inquiryRepository.findAll();
  }

  async get(id: string): Promise<Inquiry> {
    const item = await inquiryRepository.findById(id);
    if (!item) throw ApiError.notFound("Inquiry not found");
    return item;
  }

  create(data: InquiryCreateInput): Promise<Inquiry> {
    return inquiryRepository.create(data);
  }

  async update(id: string, data: InquiryUpdateInput, changedById: string | null): Promise<Inquiry> {
    const updated = await inquiryRepository.updateWithHistory(id, data, changedById);
    if (!updated) throw ApiError.notFound("Inquiry not found");
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await inquiryRepository.delete(id);
    if (!deleted) throw ApiError.notFound("Inquiry not found");
  }

  async history(id: string): Promise<InquiryStatusHistoryEntry[]> {
    await this.get(id);
    return inquiryRepository.history(id);
  }
}

export const inquiryService = new InquiryService();
