import type { Metadata } from "next";
import BlogDetailContent from "@/components/BlogDetailContent";
import { fetchBlogBySlug } from "@/lib/api/blogs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug).catch(() => null);

  if (!post) {
    return { title: "Post — RENISINFRA" };
  }

  return {
    title: post.seo.metaTitle || `${post.title} — RENISINFRA`,
    description: post.seo.metaDescription || post.excerpt,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogDetailContent slug={slug} />;
}
