import { siteRepository } from "../repositories/site.repository";
import type { SiteSettings, SiteSettingsUpdateInput } from "../types/site";

/** Singleton settings service (get + update only). */
class SiteService {
  get(): Promise<SiteSettings> {
    return siteRepository.get();
  }

  update(data: SiteSettingsUpdateInput): Promise<SiteSettings> {
    return siteRepository.update(data);
  }
}

export const siteService = new SiteService();
