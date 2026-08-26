import { HydrationBoundary } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingChat from "@/components/layout/FloatingChat";
import DailyOffersButton from "@/components/layout/DailyOffersButton";
import SmoothScroll from "@/components/SmoothScroll";
import { ScheduleVisitProvider } from "@/components/ScheduleVisitContext";
import { prefetchSiteData } from "@/lib/query/prefetch";
import { fetchSiteSettings } from "@/lib/api/site";
import { SITE_URL, absoluteUrl } from "@/lib/siteUrl";

/** Organization data for search engines, built from live CMS settings. */
async function organizationJsonLd() {
  const settings = await fetchSiteSettings().catch(() => null);
  const socials = [
    settings?.facebook,
    settings?.instagram,
    settings?.linkedin,
    settings?.youtube,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: settings?.siteName ?? "RENIESINFRA",
    url: SITE_URL,
    ...(settings?.logo ? { logo: absoluteUrl(settings.logo) } : {}),
    ...(settings?.phone ? { telephone: settings.phone } : {}),
    ...(settings?.email ? { email: settings.email } : {}),
    ...(settings?.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.address,
            addressCountry: "IN",
          },
        }
      : {}),
    ...(socials.length > 0 ? { sameAs: socials } : {}),
  };
}

// Public site chrome. Site content/settings/projects are prefetched here and
// hydrated into the client cache, so the first paint carries real content
// rather than skeletons — and crawlers see markup, not an empty shell.
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [state, jsonLd] = await Promise.all([prefetchSiteData(), organizationJsonLd()]);

  return (
    <HydrationBoundary state={state}>
      <script
        type="application/ld+json"
        // Serialised from our own CMS data, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SmoothScroll />
      <ScheduleVisitProvider>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <FloatingChat />
        <DailyOffersButton />
      </ScheduleVisitProvider>
    </HydrationBoundary>
  );
}
