import type { Metadata } from "next";
import PropertyDetailContent from "@/components/PropertyDetailContent";
import { fetchPropertyBySlug } from "@/lib/api/properties";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await fetchPropertyBySlug(slug).catch(() => null);

  if (!property) {
    return { title: "Property — RENISINFRA" };
  }

  return {
    title: property.seo.metaTitle || `${property.title} — RENISINFRA`,
    description: property.seo.metaDescription || property.description,
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PropertyDetailContent slug={slug} />;
}
