import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import PropertyDetailContent from "@/components/PropertyDetailContent";
import { fetchPropertyBySlug, fetchRelatedProjects } from "@/lib/api/properties";
import { fetchFaqs } from "@/lib/api/faqs";
import { makeQueryClient } from "@/lib/query/queryClient";
import { queryKeys } from "@/lib/query/keys";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await fetchPropertyBySlug(slug);

  if (!property) return { title: "Residence" };

  const title = property.seo.metaTitle || `${property.title} — RENIESINFRA`;
  const description = property.seo.metaDescription || property.description.slice(0, 155);
  const image = property.seo.ogImage || property.featuredImage;

  return {
    // The CMS metaTitle already carries the brand, so bypass the root
    // layout's "%s | RENIESINFRA" template rather than repeating it.
    title: { absolute: title },
    description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/projects/${slug}`,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Prefetch on the server and hydrate, so the page paints with real content
  // and crawlers see markup. Previously generateMetadata fetched the property
  // and the client then fetched it all over again.
  const qc = makeQueryClient();
  const property = await fetchPropertyBySlug(slug);
  if (!property) notFound();

  qc.setQueryData(queryKeys.properties.bySlug(slug), property);
  await Promise.all([
    qc.prefetchQuery({
      queryKey: queryKeys.projects.related(slug),
      queryFn: () => fetchRelatedProjects(slug, 3),
    }),
    qc.prefetchQuery({ queryKey: queryKeys.faqs.list(), queryFn: () => fetchFaqs() }),
  ]);

  // Search engines read residences as listings, not generic pages.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: property.title,
    description: property.description,
    url: `/projects/${property.slug}`,
    image: property.featuredImage,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.location,
      addressLocality: property.city,
      addressRegion: property.state,
      addressCountry: "IN",
    },
    ...(property.price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: property.price,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <script
        type="application/ld+json"
        // Serialised from our own data, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyDetailContent slug={slug} />
    </HydrationBoundary>
  );
}
