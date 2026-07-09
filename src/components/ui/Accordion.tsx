"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { FAQ } from "@/types/faq";

export default function Accordion({ items }: { items: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const active = open === i;
        return (
          <div key={item.id}>
            <button
              onClick={() => setOpen(active ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="font-display text-xl font-light md:text-2xl">{item.question}</span>
              <Plus
                size={22}
                className={`flex-none text-gold transition-transform duration-500 ease-[var(--ease-lux)] ${active ? "rotate-45" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {active && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 text-[0.95rem] leading-relaxed text-muted">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
