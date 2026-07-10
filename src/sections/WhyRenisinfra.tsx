"use client";

import type { LucideIcon } from "lucide-react";
import {
  Award,
  Building2,
  Home,
  Users,
  CalendarCheck,
  Trophy,
  LayoutGrid,
  MapPin,
  MapPinned,
  TrendingUp,
  ShieldCheck,
  Clock,
  KeyRound,
  Percent,
  LineChart,
  Headset,
} from "lucide-react";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import StatCounter from "@/components/ui/StatCounter";
import { cn } from "@/lib/cn";
import { WHY_RENISINFRA_STATS, INVEST_REASONS } from "@/config/why";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const WHY_ICONS: Record<string, LucideIcon> = {
  years: Award,
  residences: Building2,
  sqft: Home,
  families: Users,
  delivery: CalendarCheck,
  awards: Trophy,
  amenities: LayoutGrid,
  locations: MapPin,
};

const INVEST_ICONS: Record<string, LucideIcon> = {
  location: MapPinned,
  roi: TrendingUp,
  shield: ShieldCheck,
  clock: Clock,
  freehold: KeyRound,
  interest: Percent,
  growth: LineChart,
  support: Headset,
};

type StatItem = { icon: LucideIcon; stat: string; label: string };

// 4-column x 2-row icon/stat grid, measurements taken directly from the
// live Danube reference (danubeproperties.com "Why Danube Properties?"
// section, 1440px viewport): table-style rule lines (vertical between
// columns, horizontal under row 1), icon centered per cell, number + label
// left-aligned per cell.
function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="mt-5 grid grid-cols-2 sm:grid-cols-4"
    >
      {items.map(({ icon: Icon, stat, label }, i) => {
        const lastInRow = (i + 1) % 4 === 0;
        const firstRow = i < 4;
        return (
          <motion.div
            key={label}
            variants={fadeUp}
            className={cn(
              "px-4 pb-8 pt-9 sm:px-3",
              !lastInRow && "sm:border-r sm:border-line",
              firstRow && "border-b border-line",
            )}
          >
            <div className="flex justify-center">
              <Icon size={38} strokeWidth={1} className="text-gold" />
            </div>
            <div className="mt-6 text-left font-display text-4xl font-normal text-ink">
              <StatCounter value={stat} />
            </div>
            <p className="mt-2 text-left text-[0.72rem] uppercase leading-snug tracking-[0.08em] text-muted">
              {label}
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
        <span className="text-[18px] font-medium uppercase tracking-[0.16em] text-gold">Why</span>
        <h2 className="mt-2 font-display text-[40px] font-normal uppercase leading-[1.25] tracking-[0.08em] text-gold sm:text-[48px] sm:leading-[60px]">
          {heading}
        </h2>
      </Reveal>
      <StatGrid items={items} />
    </div>
  );
}

// Near-1:1 structural clone of the Danube "Why Danube Properties? / Why
// Invest in Dubai?" section: two edge-to-edge equal columns split by a
// single divider that runs the full section height, each with a centered
// "Why" label + large serif heading, followed by an 8-item (4x2) icon/stat
// grid with table rule lines. RENISINFRA copy and statistics only.
export default function WhyRenisinfra() {
  const whyItems: StatItem[] = WHY_RENISINFRA_STATS.map((s) => ({ ...s, icon: WHY_ICONS[s.icon] }));
  const investItems: StatItem[] = INVEST_REASONS.map((r) => ({ ...r, icon: INVEST_ICONS[r.icon] }));

  return (
    <section id="why" className="relative bg-background pb-9 pt-[90px] sm:pb-9">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-line sm:block" />

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-16 sm:grid-cols-2 sm:gap-0">
        <div className="px-6 sm:px-[52px]">
          <WhyColumn heading="RENISINFRA?" items={whyItems} />
        </div>
        <div className="px-6 sm:px-[52px]">
          <WhyColumn heading="Invest With RENISINFRA?" items={investItems} />
        </div>
      </div>
    </section>
  );
}
