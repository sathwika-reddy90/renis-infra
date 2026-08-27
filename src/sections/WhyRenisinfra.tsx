"use client";

import { motion } from "framer-motion";
import {
  Award,
  Building2,
  Compass,
  MapPin,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

interface WhyDemoItem {
  title: string;
  icon: LucideIcon;
}

/** Demo copy for the "Why Reniesinfra?" column — placeholder until CMS-managed. */
const WHY_US_ITEMS: WhyDemoItem[] = [
  { title: "Crafted for Elevated Living", icon: Building2 },
  { title: "A Legacy of Excellence", icon: Award },
  { title: "Designed Around You", icon: Compass },
];

/** Demo copy for the "Why Invest With Us?" column — placeholder until CMS-managed. */
const INVEST_ITEMS: WhyDemoItem[] = [
  { title: "Prime Locations", icon: MapPin },
  { title: "Strong Growth Potential", icon: TrendingUp },
  { title: "Trusted Delivery", icon: ShieldCheck },
];

function DemoList({ items }: { items: WhyDemoItem[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      // Reference-style cells: gold icon over a small uppercase label, with
      // thin vertical hairlines separating the three cells.
      className="mt-10 grid grid-cols-3 divide-x divide-line sm:mt-12"
    >
      {items.map((item) => (
        <motion.div
          key={item.title}
          variants={fadeUp}
          className="flex flex-col items-center px-2 py-2 text-center sm:px-4"
        >
          <item.icon
            size={34}
            strokeWidth={1.25}
            className="text-[#bda588] sm:h-10 sm:w-10"
            aria-hidden
          />
          <h3 className="mx-auto mt-4 max-w-[180px] text-[11px] font-medium uppercase leading-[1.7] tracking-[0.14em] text-[#4a4b4b] [font-family:var(--font-nav),sans-serif] sm:text-[12px] sm:tracking-[0.16em]">
            {item.title}
          </h3>
        </motion.div>
      ))}
    </motion.div>
  );
}

function WhyColumn({ heading, items }: { heading: React.ReactNode; items: WhyDemoItem[] }) {
  return (
    <div className="flex h-full flex-col">
      <Reveal className="text-center">
        <span className="text-[15px] font-medium uppercase tracking-[0.22em] text-[#888888] [font-family:var(--font-nav),sans-serif] sm:text-[18px]">
          Why
        </span>
        <h2 className="mt-3 whitespace-nowrap text-[32px] font-normal uppercase tracking-[0.094em] text-[#bda588] [font-family:var(--font-launch),sans-serif] sm:text-[clamp(30px,4.2vw,48px)] sm:tracking-[0.1em]">
          {heading}
        </h2>
      </Reveal>
      <DemoList items={items} />
    </div>
  );
}

/**
 * Two equal columns split by a divider running the full section height, each
 * with a centred "Why" label, a one-line heading and icon/label cells.
 * Content here is placeholder copy pending CMS management via /admin/content.
 */
export default function WhyRenisinfra() {
  return (
    <section id="why" className="relative bg-background py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-line sm:block" />

      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-14 sm:grid-cols-2 sm:gap-0">
        <div className="px-6 sm:px-10">
          <WhyColumn heading="RENIESINFRA?" items={WHY_US_ITEMS} />
        </div>
        <div className="px-6 sm:px-10">
          <WhyColumn heading="Invest With Us?" items={INVEST_ITEMS} />
        </div>
      </div>
    </section>
  );
}
