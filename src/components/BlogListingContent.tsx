"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import Container from "@/components/ui/Container";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import CtaBand from "@/components/CtaBand";
import { useBlogs } from "@/lib/query/hooks";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function GridSkeleton() {
  return (
    <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/3] w-full" />
          <Skeleton className="mt-4 h-3 w-24" />
          <Skeleton className="mt-2 h-6 w-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <p className="mt-16 text-center text-[0.95rem] text-muted">
      No posts published yet — check back soon.
    </p>
  );
}

export default function BlogListingContent() {
  const query = useBlogs();

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title={<>News &amp; <span className="italic text-gold-soft">Insights</span></>}
        subtitle="Launches, milestones and stories from across the RENISINFRA portfolio."
        image="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      <section className="bg-background py-24 md:py-32">
        <Container>
          <QueryView query={query} skeleton={<GridSkeleton />} errorMessage="Unable to load posts right now.">
            {(posts) => {
              const items = posts.filter((p) => p.published);
              if (items.length === 0) return <EmptyState />;

              return (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="show"
                  viewport={viewportOnce}
                  className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {items.map((post) => (
                    <motion.a key={post.id} href={`/blog/${post.slug}`} variants={fadeUp} className="group block">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-line">
                        <Image
                          src={post.coverImage || "/images/placeholder-blog.jpg"}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-[1.1s] ease-[var(--ease-lux)] group-hover:scale-105"
                        />
                        <span className="absolute right-4 top-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-gold text-white opacity-0 transition-all duration-500 ease-[var(--ease-lux)] group-hover:translate-y-0 group-hover:opacity-100">
                          <ArrowUpRight size={16} />
                        </span>
                      </div>
                      <p className="mt-5 text-[0.7rem] uppercase tracking-[0.2em] text-gold">
                        {post.category} · {formatDate(post.publishedAt)}
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-light leading-snug text-ink">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">{post.excerpt}</p>
                    </motion.a>
                  ))}
                </motion.div>
              );
            }}
          </QueryView>
        </Container>
      </section>

      <CtaBand
        eyebrow="Stay Ahead"
        title="Never miss a launch."
        text="Speak with a residence advisor to be first in line for our next address."
        primary={{ label: "Contact Us", href: "/contact" }}
        secondary={{ label: "Explore Projects", href: "/projects" }}
      />
    </>
  );
}
