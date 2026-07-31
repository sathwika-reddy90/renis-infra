import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The CMS and uploaded originals have no business in search results.
        disallow: ["/admin", "/admin/", "/uploads/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
