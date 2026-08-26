"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { useSiteContent } from "@/lib/query/hooks";
import type { StatItem } from "@/lib/api/siteContent";

/**
 * 4-column x 2-row grid of blank cells: vertical rules between columns, one
 * horizontal rule under row 1. Content is intentionally empty — only the
 * grid structure/spacing is kept as a placeholder.
 */
function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="mt-12 grid grid-cols-2 sm:grid-cols-4"
    >
      {items.map((item, i) => {
        const lastInRow = (i + 1) % 4 === 0;
        const firstRow = i < 4;
        return (
          <motion.div
            key={`${item.label}-${i}`}
            variants={fadeUp}
            className={cn(
              "min-h-[140px] px-3 py-6",
              !lastInRow && "sm:border-r sm:border-line",
              firstRow && items.length > 4 && "border-b border-line",
            )}
          />
        );
      })}
    </motion.div>
  );
}

function WhyColumn({ heading, items }: { heading: React.ReactNode; items: StatItem[] }) {
  return (
    <div>
      <Reveal className="text-center">
        <span className="text-[15px] font-medium uppercase tracking-[0.22em] text-[#888888] [font-family:var(--font-nav),sans-serif]">
          Why
        </span>
        <h2 className="mt-3 whitespace-nowrap text-[32px] font-normal uppercase tracking-[3px] text-[#bda588] [font-family:var(--font-launch),sans-serif] sm:text-[48px] sm:tracking-[4.8px]">
          {heading}
        </h2>
      </Reveal>
      <StatGrid items={items} />
    </div>
  );
}

/**
 * Two equal columns split by a divider running the full section height, each
 * with a centred "Why" label, a one-line heading and an icon/stat grid.
 * Both grids are CMS-managed via /admin/content → Why Us / Invest.
 */
export default function WhyRenisinfra() {
  const { data, isPending } = useSiteContent();

  if (isPending) {
    return (
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-14 px-6 sm:grid-cols-2 sm:px-10">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-6">
              <Skeleton className="h-9 w-56" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 8 }).map((_, j) => (
                  <Skeleton key={j} className="h-24" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const whyItems = data?.whyUs ?? [];
  const investItems = data?.invest ?? [];
  if (whyItems.length === 0 && investItems.length === 0) return null;

  return (
    <section id="why" className="relative bg-background py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-line sm:block" />

      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-14 sm:grid-cols-2 sm:gap-0">
        {whyItems.length > 0 && (
          <div className="px-6 sm:px-10">
            <WhyColumn heading="RENIESINFRA?" items={whyItems} />
          </div>
        )}
        {investItems.length > 0 && (
          <div className="px-6 sm:px-10">
            <WhyColumn heading="Invest With Us?" items={investItems} />
          </div>
        )}
      </div>
    </section>
  );
}
