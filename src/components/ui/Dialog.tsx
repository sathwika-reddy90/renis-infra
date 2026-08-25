"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { easeLux } from "@/lib/motion";
import { useOverlay } from "@/lib/useOverlay";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE: Record<Size, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Rendered as the accessible name. Pass `hideTitle` to visually hide it. */
  title: string;
  hideTitle?: boolean;
  description?: string;
  size?: Size;
  children: React.ReactNode;
  className?: string;
}

/**
 * Accessible modal base for the public site: labelled dialog role, focus trap,
 * Escape to close, scroll lock, restore focus on close.
 */
export default function Dialog({
  open,
  onClose,
  title,
  hideTitle = false,
  description,
  size = "md",
  children,
  className,
}: DialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useOverlay(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
          style={{ zIndex: "var(--z-modal)" }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: easeLux }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative flex max-h-[88vh] w-full flex-col bg-white shadow-overlay outline-none",
              SIZE[size],
              className,
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-gold"
            >
              <X size={18} />
            </button>

            {/* data-lenis-prevent: this pane scrolls itself, so the virtual
                page scroll must not swallow the wheel event here. */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10"
            >
              <h2
                id={titleId}
                className={cn(
                  "font-display text-h1 font-semibold text-ink",
                  hideTitle && "sr-only",
                )}
              >
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-3 text-body-sm text-muted">
                  {description}
                </p>
              )}
              <div className={hideTitle ? "" : "mt-7"}>{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
