"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote, ArrowLeft, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import QueryView from "@/components/ui/QueryView";
import { useTestimonials } from "@/lib/query/hooks";
import type { Testimonial } from "@/types/testimonial";
import { easeLux } from "@/lib/motion";

function CarouselSkeleton() {
  return (
    <div className="mx-auto mt-14 flex max-w-3xl flex-col items-center gap-4">
      <div className="h-7 w-3/4 animate-pulse rounded bg-white/10" />
      <div className="h-7 w-2/3 animate-pulse rounded bg-white/10" />
      <div className="mt-6 h-4 w-32 animate-pulse rounded bg-white/10" />
    </div>
  );
}

function Carousel({ items }: { items: Testimonial[] }) {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);

  const paginate = useCallback(
    (d: number) => {
      setState(([i]) => [(i + d + items.length) % items.length, d]);
    },
    [items.length],
  );

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => paginate(1), 6500);
    return () => clearInterval(id);
  }, [paginate, items.length]);

  if (items.length === 0) return null;
  const t = items[Math.min(index, items.length - 1)];

  return (
    <div className="relative mx-auto mt-14 max-w-3xl text-center">
      <Quote className="mx-auto mb-8 text-gold" size={44} strokeWidth={1} />

      <div className="relative min-h-[220px] md:min-h-[200px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.blockquote
            key={t.id}
            custom={dir}
            initial={{ opacity: 0, x: dir >= 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir >= 0 ? -40 : 40 }}
            transition={{ duration: 0.6, ease: easeLux }}
            className="absolute inset-0"
          >
            <p className="font-display text-2xl font-light leading-relaxed text-white/90 md:text-[2rem]">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="mt-8">
              <p className="text-sm font-medium tracking-[0.12em] text-white">{t.name}</p>
              <p className="mt-1 text-[0.78rem] uppercase tracking-[0.2em] text-gold">{t.role}</p>
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex items-center justify-center gap-6">
        <button
          aria-label="Previous testimonial"
          onClick={() => paginate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:border-gold hover:text-gold"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => setState([i, i > index ? 1 : -1])}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-8 bg-gold" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
        <button
          aria-label="Next testimonial"
          onClick={() => paginate(1)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:border-gold hover:text-gold"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const query = useTestimonials();

  return (
    <section id="testimonials" className="bg-ink py-24 text-white md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Resident Voices"
          title={
            <>
              Words from <span className="italic text-gold">Home</span>
            </>
          }
          invert
        />

        <QueryView query={query} skeleton={<CarouselSkeleton />} invertError>
          {(items) => <Carousel items={items} />}
        </QueryView>
      </Container>
    </section>
  );
}
