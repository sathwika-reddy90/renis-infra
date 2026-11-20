import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import ProjectCategoryListing from "@/components/ProjectCategoryListing";
import CtaBand from "@/components/CtaBand";
import {
  PROJECT_CATEGORY_SLUGS,
  categoryHref,
  categoryTitle,
  findProjectCategory,
} from "@/config/projectCategories";

/** Categories are a fixed taxonomy, so anything outside it is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECT_CATEGORY_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const match = findProjectCategory(slug);
  if (!match) return { title: "Projects" };

  const title = categoryTitle(match.group, match.category);
  return {
    title,
    description: `${title} from the RENIESINFRA portfolio.`,
    alternates: { canonical: categoryHref(slug) },
  };
}

export default async function ProjectCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const match = findProjectCategory(slug);
  if (!match) notFound();

  const { group, category } = match;
  // Italic gold accent on the last word, as on the other page heroes.
  const split = category.label.lastIndexOf(" ");
  const lead = category.label.slice(0, split);
  const accent = category.label.slice(split + 1);

  return (
    <>
      <PageHero
        variant="brand"
        eyebrow={group.label}
        title={
          <>
            {lead} <span className="italic text-gold-soft">{accent}</span>
          </>
        }
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: categoryTitle(group, category) },
        ]}
      />

      <ProjectCategoryListing categorySlug={category.slug} />

      <CtaBand
        contentKey="projects"
        title="Can't find the right residence?"
        text="Share your requirements and our advisors will curate a shortlist tailored to you."
        primary={{ label: "Schedule a Visit", href: "/contact" }}
        primaryOpensVisitModal
        secondary={{ label: "View Gallery", href: "/gallery" }}
      />
    </>
  );
}
