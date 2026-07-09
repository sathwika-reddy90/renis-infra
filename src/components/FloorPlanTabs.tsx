"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { FloorPlan } from "@/types/property";

export default function FloorPlanTabs({ plans }: { plans: FloorPlan[] }) {
  const [active, setActive] = useState(0);
  const plan = plans[active];

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {plans.map((p, i) => (
          <button
            key={p.type}
            onClick={() => setActive(i)}
            className={cn(
              "px-6 py-3 text-[0.75rem] uppercase tracking-[0.16em] transition-colors duration-300",
              active === i
                ? "bg-ink text-white"
                : "border border-line text-muted hover:border-gold hover:text-ink",
            )}
          >
            {p.type}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-cream">
            <Image src={plan.image} alt={plan.type} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <h3 className="font-display text-3xl font-light">{plan.type}</h3>
            <p className="mt-2 text-[0.82rem] uppercase tracking-[0.2em] text-gold">
              Carpet Area · {plan.area}
            </p>
            <ul className="mt-8 space-y-4">
              {plan.details.map((d) => (
                <li key={d} className="flex items-center gap-3 text-[0.95rem] text-ink">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-gold text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
