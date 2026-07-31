"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Maximize2 } from "lucide-react";
import Tabs, { useTabs } from "@/components/ui/Tabs";
import { easeLux } from "@/lib/motion";
import type { FloorPlan } from "@/types/property";

export default function FloorPlanTabs({
  plans,
  onExpand,
}: {
  plans: FloorPlan[];
  /** Opens the plan image in the page lightbox. */
  onExpand?: (image: string) => void;
}) {
  // Plan ids are unique; `type` is not (two towers can share a config name),
  // which previously collided as a React key.
  const tabs = plans.map((p, i) => ({
    value: p.id || `plan-${i}`,
    label: p.type,
    hint: p.price || p.area || undefined,
  }));

  const { value, onChange, tabId, panelId, panelProps } = useTabs(tabs);
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.value === value),
  );
  const plan = plans[activeIndex];

  if (!plan) return null;

  return (
    <div>
      <Tabs
        items={tabs}
        value={value}
        onChange={onChange}
        tabId={tabId}
        panelId={panelId}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          {...panelProps(value)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: easeLux }}
          className="mt-10 grid grid-cols-1 items-center gap-10 outline-none lg:grid-cols-2 lg:gap-16"
        >
          <div className="group relative aspect-[4/3] overflow-hidden bg-cream">
            <Image
              src={plan.image}
              alt={`${plan.type} floor plan`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {onExpand && (
              <button
                type="button"
                onClick={() => onExpand(plan.image)}
                aria-label={`Enlarge ${plan.type} floor plan`}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center bg-white/90 text-ink opacity-0 backdrop-blur transition-opacity duration-[var(--duration-base)] group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Maximize2 size={16} aria-hidden />
              </button>
            )}
          </div>

          <div>
            <h3 className="font-display text-display-3 font-light text-ink">{plan.type}</h3>

            <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              {plan.area && (
                <p className="text-[0.82rem] uppercase tracking-[0.2em] text-gold">
                  {plan.area}
                </p>
              )}
              {/* The model has carried a price all along; the old tabs never showed it. */}
              {plan.price && (
                <p className="font-display text-h3 text-ink">{plan.price}</p>
              )}
            </div>

            {plan.details.length > 0 && (
              <ul className="mt-8 space-y-4">
                {plan.details.map((d) => (
                  <li key={d} className="flex items-center gap-3 text-body text-ink">
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-gold text-white">
                      <Check size={12} strokeWidth={3} aria-hidden />
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
