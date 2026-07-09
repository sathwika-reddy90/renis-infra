"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useOverlay } from "./Modal";

/** Right-hand slide-over used for create/edit forms. */
export default function Drawer({
  open,
  onClose,
  title,
  wide = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  useOverlay(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/50"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl",
              wide ? "max-w-3xl" : "max-w-lg",
            )}
          >
            <header className="flex flex-none items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-display text-xl font-light">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-muted transition-colors hover:text-ink"
              >
                <X size={18} />
              </button>
            </header>
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
