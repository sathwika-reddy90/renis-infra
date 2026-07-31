"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import PageHero from "@/components/PageHero";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import QueryView from "@/components/ui/QueryView";
import ErrorState from "@/components/ui/ErrorState";
import CtaBand from "@/components/CtaBand";
import { useBlogBySlug } from "@/lib/query/hooks";
import type { BlogPost } from "@/types/blog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function PageSkeleton() {
  return (
    <>
      <div className="min-h-[50vh] animate-pulse bg-ink" />
      <Container className="py-24">
        <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-line" />
        <div className="mx-auto mt-3 h-4 w-2/3 animate-pulse rounded bg-line" />
      </Container>
    </>
  );
}

function Article({ post }: { post: BlogPost }) {
  // Content is authored as plain text/markdown in the CMS (no rich-text
  // renderer yet) — rendered as paragraphs, not raw HTML, to avoid
  // executing unsanitized markup.
  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow={post.category}
        title={post.title}
        subtitle={post.excerpt}
        image={post.coverImage || "/images/placeholder-blog.jpg"}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      <section className="bg-background py-24 md:py-32">
        <Container className="max-w-3xl">
          <Reveal className="flex flex-wrap items-center gap-4 text-[0.78rem] uppercase tracking-[0.16em] text-muted">
            <span>{formatDate(post.publishedAt)}</span>
            <span className="h-1 w-1 rounded-full bg-line" />
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-gold" />
              {post.readTime}
            </span>
          </Reveal>

          <div className="mt-10 space-y-6">
            {paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.03}>
                <p
                  className={
                    // Lead paragraph gets editorial emphasis.
                    i === 0
                      ? "font-display text-h3 font-light leading-relaxed text-ink"
                      : "text-body-lg text-ink/85"
                  }
                >
                  {p}
                </p>
              </Reveal>
            ))}
          </div>

          {post.tags.length > 0 && (
            <div className="mt-14 flex flex-wrap gap-2 border-t border-line pt-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-line px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.14em] text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-10">
            <Link href="/blog" className="text-[0.8rem] uppercase tracking-[0.2em] text-gold hover:underline">
              ← Back to all posts
            </Link>
          </div>
        </Container>
      </section>

      <CtaBand
        contentKey="blog"
        eyebrow="Continue the Story"
        title="Discover the address behind the headline."
        primary={{ label: "Explore Projects", href: "/projects" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
    </>
  );
}

export default function BlogDetailContent({ slug }: { slug: string }) {
  const query = useBlogBySlug(slug);

  return (
    <QueryView query={query} skeleton={<PageSkeleton />} errorMessage="Unable to load this post right now.">
      {(post) =>
        post ? (
          <Article post={post} />
        ) : (
          <div className="pt-40 pb-24">
            <ErrorState message="This post could not be found." />
          </div>
        )
      }
    </QueryView>
  );
}
