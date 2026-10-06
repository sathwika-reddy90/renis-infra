"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Container from "@/components/ui/Container";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useTestimonials } from "@/lib/query/hooks";
import type { Testimonial } from "@/types/testimonial";
import { easeLux } from "@/lib/motion";

const PAGE_SIZE = 2;

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

function ReviewCard({ item }: { item: Testimonial }) {
  const stars = Math.max(0, Math.min(5, item.rating ?? 5));
  return (
    <div className="flex h-full flex-col bg-white p-8 text-left md:p-10">
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5 text-[#e8b84b]" aria-hidden>
          {Array.from({ length: stars }).map((_, i) => (
            <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
          ))}
        </div>
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#bda588]">
          {item.name}
        </span>
      </div>
      <p className="mt-5 text-[14px] leading-relaxed text-[#4a4b4b] [font-family:var(--font-nav),sans-serif]">
        {item.quote}
      </p>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
      <Skeleton className="h-[220px]" />
      <Skeleton className="h-[220px]" />
    </div>
  );
}

function ReviewsCarousel({ items }: { items: Testimonial[] }) {
  const pages = chunk(items, PAGE_SIZE);
  const [[page, dir], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  const paginate = useCallback(
    (d: number) => {
      setState(([p]) => [(p + d + pages.length) % pages.length, d]);
    },
    [pages.length],
  );

  // Autoplay always runs (pausing on hover so it can't yank a card away
  // mid-read). Reduced-motion users still get the rotation — the OS setting
  // must not freeze the carousel — just with a crossfade instead of a slide.
  useEffect(() => {
    if (pages.length < 2 || paused) return;
    const id = setInterval(() => paginate(1), 2500);
    return () => clearInterval(id);
  }, [paginate, pages.length, paused]);

  if (pages.length === 0) return null;
  const current = pages[Math.min(page, pages.length - 1)];

  return (
    <div
      className="relative mx-auto mt-12 max-w-4xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {pages.length > 1 && (
        <button
          type="button"
          aria-label="Previous reviews"
          onClick={() => paginate(-1)}
          className="absolute left-0 top-1/2 z-10 hidden -translate-x-12 -translate-y-1/2 text-muted-light transition-colors hover:text-muted lg:block"
        >
          <ChevronLeft size={22} strokeWidth={1.5} aria-hidden />
        </button>
      )}

      <div className="relative min-h-[220px] overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={page}
            custom={dir}
            initial={{ opacity: 0, x: reduced ? 0 : dir >= 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduced ? 0 : dir >= 0 ? -40 : 40 }}
            transition={{ duration: reduced ? 0.25 : 0.5, ease: easeLux }}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {current.map((item) => (
              <ReviewCard key={item.id} item={item} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {pages.length > 1 && (
        <button
          type="button"
          aria-label="Next reviews"
          onClick={() => paginate(1)}
          className="absolute right-0 top-1/2 z-10 hidden translate-x-12 -translate-y-1/2 text-muted-light transition-colors hover:text-muted lg:block"
        >
          <ChevronRight size={22} strokeWidth={1.5} aria-hidden />
        </button>
      )}

      {pages.length > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to review page ${i + 1}`}
              aria-current={i === page ? "true" : undefined}
              onClick={() => setState([i, i > page ? 1 : -1])}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === page ? "bg-ink" : "bg-muted-light/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Testimonials() {
  const query = useTestimonials();

  return (
    <section id="testimonials" className="bg-gray-50 pt-8 pb-16 sm:pt-8 sm:pb-20">
      <Container className="text-center">
        <span className="text-[18px] font-medium uppercase tracking-[0.22em] text-[#888888] [font-family:var(--font-nav),sans-serif]">
          Reviews
        </span>
        <h2 className="mt-3 text-[26px] font-normal uppercase tracking-[0.02em] text-[#bda588] [font-family:var(--font-launch),sans-serif] sm:text-[48px] lg:whitespace-nowrap">
          A Reputation Built on Trust
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] text-foreground [font-family:var(--font-nav),sans-serif] sm:max-w-none lg:whitespace-nowrap">
          Thousands of verified reviews from satisfied homeowners and investors across Hyderabad.
        </p>

        <QueryView query={query} skeleton={<ReviewsSkeleton />}>
          {(items) => <ReviewsCarousel items={items} />}
        </QueryView>
      </Container>
    </section>
  );
}
