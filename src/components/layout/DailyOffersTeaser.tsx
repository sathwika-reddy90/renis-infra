"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { easeLux } from "@/lib/motion";

/**
 * Small floating notification shown briefly after page load, pointing at the
 * full Daily Offers modal (rendered by DailyOffersButton) without opening it
 * automatically. Stacks directly above the circular Daily Offers trigger and
 * the WhatsApp bubble, in the same fixed bottom-right column.
 */
export default function DailyOffersTeaser({
  visible,
  onOpen,
  onDismiss,
}: {
  visible: boolean;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.4, ease: easeLux }}
          role="button"
          tabIndex={0}
          onClick={onOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen();
            }
          }}
          aria-label="View Daily Offers"
          className="floating-widget fixed bottom-[160px] right-6 z-[60] w-[min(272px,calc(100vw-3rem))] cursor-pointer border border-white/10 bg-ink p-5 shadow-[0_16px_40px_rgba(11,23,48,0.35)] transition-transform duration-[var(--duration-base)] hover:-translate-y-0.5 md:bottom-[192px]"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            aria-label="Dismiss Daily Offers"
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center text-white/50 transition-colors hover:text-white"
          >
            <X size={14} aria-hidden />
          </button>

          <span className="flex items-center gap-2 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-gold">
            <span aria-hidden className="h-px w-4 bg-gold" />
            Exclusive
          </span>
          <h3 className="mt-2 pr-4 text-[15px] font-semibold uppercase tracking-[0.08em] text-white [font-family:var(--font-nav),sans-serif]">
            Daily Offers
          </h3>
          <p className="mt-1.5 pr-4 text-[0.82rem] leading-snug text-white/65 [font-family:var(--font-nav),sans-serif]">
            Exclusive opportunities, curated for you.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 border border-gold/50 px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-gold transition-colors duration-[var(--duration-base)]">
            View Offers
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
