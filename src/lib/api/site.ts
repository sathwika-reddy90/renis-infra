import { apiClient } from "./client";
import { toLocalAsset, type ApiSiteSettings } from "./dto";

export interface SiteSettings {
  siteName: string;
  phone: string;
  email: string;
  address: string;
  logo?: string;
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
    // Uploaded through the CMS, so it needs the same origin-stripping as
    // every other media URL (see toLocalAsset).
    logo: toLocalAsset(data.logo),
    facebook: data.facebook,
    instagram: data.instagram,
    linkedin: data.linkedin,
    youtube: data.youtube,
  };
}
