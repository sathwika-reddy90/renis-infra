"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useBlogs } from "@/lib/query/hooks";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import type { BlogPost } from "@/types/blog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function GridSkeleton() {
  return (
    <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="mt-4 h-3 w-24" />
          <Skeleton className="mt-2 h-5 w-full" />
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

export default function NewsEvents() {
  const query = useBlogs();

  return (
    <section id="news" className="bg-cream py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Stay Informed"
          title={
            <>
              News <span className="italic text-gold">&amp; Events</span>
            </>
          }
          description="The latest from RENIESINFRA — launches, milestones and moments worth sharing."
        />

        <QueryView query={query} skeleton={<GridSkeleton />} errorMessage="Unable to load news right now.">
          {(posts: BlogPost[]) => {
            const items = posts.filter((p) => p.published).slice(0, 4);
            if (items.length === 0) return <EmptyState />;

            return (
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
              >
                {items.map((post) => (
                  <motion.a
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    variants={fadeUp}
                    className="group block"
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-line">
                      <Image
                        src={post.coverImage || "/images/placeholder-blog.jpg"}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition-transform duration-[1.1s] ease-[var(--ease-lux)] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute right-4 top-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-gold text-white opacity-0 transition-all duration-500 ease-[var(--ease-lux)] group-hover:translate-y-0 group-hover:opacity-100">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                    <p className="mt-4 text-[0.7rem] uppercase tracking-[0.2em] text-gold">
                      {formatDate(post.publishedAt)}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-medium leading-snug text-ink">
                      {post.title}
                    </h3>
                  </motion.a>
                ))}
              </motion.div>
            );
          }}
        </QueryView>

        <div className="mt-14 flex justify-center">
          <Button href="/blog" variant="ghost">
            View More
          </Button>
        </div>
      </Container>
    </section>
  );
}
