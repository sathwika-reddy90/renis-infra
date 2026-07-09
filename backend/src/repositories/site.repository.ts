import { Prisma, type SiteSettings as SiteRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { run } from "../utils/prismaError";
import { opt } from "../utils/optional";
import type { SiteSettings, SiteSettingsUpdateInput } from "../types/site";

// One fixed row backs the singleton settings resource.
const SINGLETON_ID = "site-settings";

const DEFAULTS: Prisma.SiteSettingsCreateInput = {
  id: SINGLETON_ID,
  siteName: "RENISINFRA",
  phone: "+91 90000 12345",
  email: "residences@renisinfra.com",
  address: "Road No. 45, Jubilee Hills, Hyderabad 500033",
};

function toDto(row: SiteRow): SiteSettings {
  return {
    id: row.id,
    siteName: row.siteName,
    phone: row.phone,
    email: row.email,
    address: row.address,
    logo: opt(row.logo),
    facebook: opt(row.facebook),
    instagram: opt(row.instagram),
    linkedin: opt(row.linkedin),
    youtube: opt(row.youtube),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

class SiteSettingsRepository {
  async get(): Promise<SiteSettings> {
    // Upsert guarantees the singleton exists without a race.
    const row = await run("Site settings", () =>
      prisma.siteSettings.upsert({
        where: { id: SINGLETON_ID },
        update: {},
        create: DEFAULTS,
      }),
    );
    return toDto(row);
  }

  async update(data: SiteSettingsUpdateInput): Promise<SiteSettings> {
    const row = await run("Site settings", () =>
      prisma.siteSettings.upsert({
        where: { id: SINGLETON_ID },
        update: data,
        create: { ...DEFAULTS, ...data },
      }),
    );
    return toDto(row);
  }
}

export const siteRepository = new SiteSettingsRepository();
