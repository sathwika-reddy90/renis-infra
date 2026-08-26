"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { easeLux } from "@/lib/motion";
import type { FAQ } from "@/types/faq";

/**
 * Disclosure list. `variant="circle"` puts the toggle in a bordered circle —
 * the treatment the homepage FAQ section used to hand-roll as a near-copy of
 * this component.
 */
export default function Accordion({
  items,
  variant = "plain",
  defaultOpen = 0,
  /** Swaps the row typography/spacing for a dense, sans-serif reference
   *  match (homepage FAQ) — every other consumer keeps the default look. */
  compact = false,
}: {
  items: FAQ[];
  variant?: "plain" | "circle";
  /** Index open on mount; pass null for all-collapsed. */
  defaultOpen?: number | null;
  compact?: boolean;
}) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div
      className={cn(
        compact
          ? "space-y-[18px]"
          : variant === "plain"
            ? "divide-y divide-line border-y border-line"
            : "divide-y divide-line",
      )}
    >
      {items.map((item, i) => {
        const active = open === i;
        const buttonId = `${baseId}-trigger-${i}`;
        const panelId = `${baseId}-panel-${i}`;

        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={active}
                aria-controls={panelId}
                onClick={() => setOpen(active ? null : i)}
                className={cn(
                  "box-border flex w-full items-center justify-between gap-6 text-left",
                  compact ? "h-[49px] border border-line bg-[#f8f9fb] px-[15px]" : "py-6",
                )}
              >
                <span
                  className={
                    compact
                      ? "text-[15px] font-light text-[#222222] [font-family:var(--font-nav),sans-serif]"
                      : "font-display text-h3 font-medium text-ink"
                  }
                >
                  {item.question}
                </span>
                {variant === "circle" ? (
                  <motion.span
                    animate={{ rotate: active ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: easeLux }}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-line text-gold"
                  >
                    <Plus size={16} aria-hidden />
                  </motion.span>
                ) : (
                  <Plus
                    size={22}
                    aria-hidden
                    className={cn(
                      "flex-none text-gold transition-transform duration-[var(--duration-slow)] ease-[var(--ease-lux)]",
                      active && "rotate-45",
                    )}
                  />
                )}
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {active && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: easeLux }}
                  className={cn(
                    "overflow-hidden",
                    compact && "border-x border-b border-line bg-[#f8f9fb]",
                  )}
                >
                  <p
                    className={cn(
                      "max-w-2xl text-body text-muted",
                      compact ? "px-[15px] pb-[15px]" : "pb-6",
                    )}
                  >
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
