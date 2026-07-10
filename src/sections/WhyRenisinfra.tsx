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

// 4-column x 2-row icon/stat grid: vertical rules between columns, one
// horizontal rule under row 1, icon centered per cell, number + label
// left-aligned per cell — compact sizing to match the Danube reference's
// tight row pitch.
function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="mt-8 grid grid-cols-2 sm:grid-cols-4"
    >
      {items.map(({ icon: Icon, stat, label }, i) => {
        const lastInRow = (i + 1) % 4 === 0;
        const firstRow = i < 4;
        return (
          <motion.div
            key={label}
            variants={fadeUp}
            className={cn(
              "px-3 py-5",
              !lastInRow && "sm:border-r sm:border-line",
              firstRow && "border-b border-line",
            )}
          >
            <div className="flex justify-center">
              <Icon size={26} strokeWidth={1.25} className="text-gold" />
            </div>
            <div className="mt-3 text-left font-display text-2xl font-normal text-ink sm:text-[28px]">
              <StatCounter value={stat} />
            </div>
            <p className="mt-1 text-left text-[0.66rem] uppercase leading-snug tracking-[0.06em] text-muted">
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
        <span className="text-[13px] font-medium uppercase tracking-[0.16em] text-gold">Why</span>
        <h2 className="mt-1 whitespace-nowrap font-display text-2xl font-normal uppercase tracking-[0.03em] text-gold sm:text-3xl xl:text-[40px]">
          {heading}
        </h2>
      </Reveal>
      <StatGrid items={items} />
    </div>
  );
}

// Structural clone of the Danube "Why Danube Properties? / Why Invest in
// Dubai?" section: two equal columns split by a single divider running the
// full section height, each with a centered "Why" label + one-line serif
// heading, followed by an 8-item (4x2) icon/stat grid with table rule
// lines. RENISINFRA copy and statistics only.
export default function WhyRenisinfra() {
  const whyItems: StatItem[] = WHY_RENISINFRA_STATS.map((s) => ({ ...s, icon: WHY_ICONS[s.icon] }));
  const investItems: StatItem[] = INVEST_REASONS.map((r) => ({ ...r, icon: INVEST_ICONS[r.icon] }));

  return (
    <section id="why" className="relative bg-background py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-line sm:block" />

      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-14 sm:grid-cols-2 sm:gap-0">
        <div className="px-6 sm:px-10">
          <WhyColumn heading="RENISINFRA?" items={whyItems} />
        </div>
        <div className="px-6 sm:px-10">
          <WhyColumn heading="Invest With Us?" items={investItems} />
        </div>
      </div>
    </section>
  );
}
