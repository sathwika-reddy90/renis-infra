import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import BlogDetailContent from "@/components/BlogDetailContent";
import { fetchBlogBySlug } from "@/lib/api/blogs";
import { makeQueryClient } from "@/lib/query/queryClient";
import { queryKeys } from "@/lib/query/keys";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug).catch(() => null);

  if (!post) return { title: "Post" };

  const title = post.seo.metaTitle || post.title;
  const description = post.seo.metaDescription || post.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/blog/${slug}`,
      publishedTime: post.publishedAt,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Prefetch and hydrate. Previously generateMetadata fetched the post and
  // the client immediately fetched the same post again.
  const post = await fetchBlogBySlug(slug).catch(() => null);
  if (!post) notFound();

  const qc = makeQueryClient();
  qc.setQueryData(queryKeys.blogs.bySlug(slug), post);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: post.author.name },
    keywords: post.seo.keywords?.join(", "),
  };

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <script
        type="application/ld+json"
        // Serialised from our own data, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogDetailContent slug={slug} />
    </HydrationBoundary>
  );
}
