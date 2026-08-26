"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgePercent } from "lucide-react";
import { easeLux } from "@/lib/motion";
import DailyOffersPanel from "./DailyOffersPanel";
import DailyOffersTeaser from "./DailyOffersTeaser";

/**
 * Floating trigger pinned above the WhatsApp bubble on every public page.
 * Positioning mirrors FloatingChat.tsx's fixed bottom-right placement, offset
 * upward by that button's own height plus a breathing gap so neither ever
 * overlaps the other.
 */
export default function DailyOffersButton() {
  const [open, setOpen] = useState(false);
  const [teaserVisible, setTeaserVisible] = useState(false);

  // Small teaser announces itself shortly after each fresh page load/refresh;
  // it never persists a "seen" flag, so it reappears every time by design.
  useEffect(() => {
    const timer = setTimeout(() => setTeaserVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const openPanel = () => {
    setTeaserVisible(false);
    setOpen(true);
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={openPanel}
        aria-label="View Daily Offers"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.3, ease: easeLux }}
        className="group fixed bottom-[92px] right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-gold shadow-[var(--shadow-lift)] transition-colors duration-[var(--duration-base)] hover:bg-gold-deep md:bottom-[104px] md:h-16 md:w-16"
      >
        <BadgePercent size={24} className="text-white md:h-7 md:w-7" aria-hidden />
        <span
          role="tooltip"
          className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-sm bg-ink px-2.5 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          Daily Offers
        </span>
      </motion.button>

      <DailyOffersTeaser
        visible={teaserVisible}
        onOpen={openPanel}
        onDismiss={() => setTeaserVisible(false)}
      />

      <DailyOffersPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
