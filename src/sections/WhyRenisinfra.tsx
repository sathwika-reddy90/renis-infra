"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

interface WhyDemoItem {
  title: string;
  desc: string;
}

/** Demo copy for the "Why Reniesinfra?" column — placeholder until CMS-managed. */
const WHY_US_ITEMS: WhyDemoItem[] = [
  {
    title: "Crafted for Elevated Living",
    desc: "Thoughtfully designed residences combining architecture, craftsmanship and modern luxury.",
  },
  {
    title: "A Legacy of Excellence",
    desc: "A commitment to quality, transparency and exceptional residential experiences.",
  },
  {
    title: "Designed Around You",
    desc: "Every detail is considered to create refined spaces that feel personal, timeless and effortless.",
  },
];

/** Demo copy for the "Why Invest With Us?" column — placeholder until CMS-managed. */
const INVEST_ITEMS: WhyDemoItem[] = [
  {
    title: "Prime Locations",
    desc: "Strategically positioned residences in Hyderabad's most promising and established neighbourhoods.",
  },
  {
    title: "Strong Growth Potential",
    desc: "Projects designed around locations with long-term residential and investment potential.",
  },
  {
    title: "Trusted Delivery",
    desc: "A focused approach to quality, transparency and timely project execution.",
  },
];

function DemoList({ items }: { items: WhyDemoItem[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="mt-12 space-y-8"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.title}
          variants={fadeUp}
          className="border-t border-line pt-6 first:border-t-0 first:pt-0"
        >
          <span className="text-[13px] font-semibold text-[#bda588] [font-family:var(--font-nav),sans-serif]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-2 text-[17px] font-medium text-[#1a1a1a] [font-family:var(--font-nav),sans-serif]">
            {item.title}
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[#4a4b4b] [font-family:var(--font-nav),sans-serif]">
            {item.desc}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function WhyColumn({ heading, items }: { heading: React.ReactNode; items: WhyDemoItem[] }) {
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
      <DemoList items={items} />
    </div>
  );
}

/**
 * Two equal columns split by a divider running the full section height, each
 * with a centred "Why" label, a one-line heading and demo content cards.
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
