"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import Skeleton from "@/components/ui/Skeleton";
import StatCounter from "@/components/ui/StatCounter";
import { cn } from "@/lib/cn";
import { resolveIcon } from "@/lib/icons";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { useSiteContent } from "@/lib/query/hooks";
import type { StatItem } from "@/lib/api/siteContent";

/**
 * 4-column x 2-row icon/stat grid: vertical rules between columns, one
 * horizontal rule under row 1, icon centred per cell, number + label
 * left-aligned per cell.
 */
function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="mt-8 grid grid-cols-2 sm:grid-cols-4"
    >
      {items.map((item, i) => {
        const Icon = resolveIcon(item.icon);
        const lastInRow = (i + 1) % 4 === 0;
        const firstRow = i < 4;
        return (
          <motion.div
            key={`${item.label}-${i}`}
            variants={fadeUp}
            className={cn(
              "px-3 py-5",
              !lastInRow && "sm:border-r sm:border-line",
              firstRow && items.length > 4 && "border-b border-line",
            )}
          >
            <div className="flex justify-center">
              <Icon size={26} strokeWidth={1.25} className="text-gold" aria-hidden />
            </div>
            <div className="mt-3 text-left font-display text-2xl font-normal text-ink sm:text-[28px]">
              <StatCounter value={item.stat} />
            </div>
            <p className="mt-1 text-left text-[0.66rem] uppercase leading-snug tracking-[0.06em] text-muted">
              {item.label}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function WhyColumn({ heading, items }: { heading: React.ReactNode; items: StatItem[] }) {
  return (
    <div>
      <Reveal className="text-center">
        <span className="text-[13px] font-medium uppercase tracking-[0.16em] text-gold">Why</span>
        <h2 className="mt-1 whitespace-nowrap font-display text-2xl font-normal uppercase tracking-[0.03em] text-gold sm:text-3xl xl:text-[40px]">
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
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-14 px-6 sm:grid-cols-2 sm:px-10">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-6">
              <Skeleton className="mx-auto h-9 w-56" />
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
    <section id="why" className="relative bg-background py-16 sm:py-20">
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
