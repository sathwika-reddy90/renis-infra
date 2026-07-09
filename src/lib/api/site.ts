import { apiClient } from "./client";
import type { ApiSiteSettings } from "./dto";

export interface SiteSettings {
  siteName: string;
  phone: string;
  email: string;
  address: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

export async function fetchSiteSettings(signal?: AbortSignal): Promise<SiteSettings> {
  const data = await apiClient.get<ApiSiteSettings>("/site", signal);
  return {
    siteName: data.siteName,
    phone: data.phone,
    email: data.email,
    address: data.address,
    facebook: data.facebook,
    instagram: data.instagram,
    linkedin: data.linkedin,
    youtube: data.youtube,
  };
}
