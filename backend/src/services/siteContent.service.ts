import { siteContentRepository } from "../repositories/siteContent.repository";
import type { SiteContent, SiteContentUpdateInput } from "../types/siteContent";

/** Singleton marketing-copy service (get + partial update only). */
class SiteContentService {
  get(): Promise<SiteContent> {
    return siteContentRepository.get();
  }

  update(data: SiteContentUpdateInput): Promise<SiteContent> {
    return siteContentRepository.update(data);
  }
}

export const siteContentService = new SiteContentService();
