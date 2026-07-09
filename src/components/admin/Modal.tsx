"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";
import { AdminButton } from "./ui";

/** Locks body scroll + closes on Escape while an overlay is open. */
export function useOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
}

export default function Modal({
  open,
  onClose,
  title,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: "sm" | "md" | "lg";
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex max-h-[85vh] w-full flex-col bg-white shadow-2xl",
              size === "sm" && "max-w-md",
              size === "md" && "max-w-xl",
              size === "lg" && "max-w-3xl",
            )}
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-display text-xl font-light">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-muted transition-colors hover:text-ink"
              >
                <X size={18} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle size={18} />
        </span>
        <p className="text-sm leading-relaxed text-muted">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <AdminButton variant="ghost" onClick={onClose}>
          Cancel
        </AdminButton>
        <AdminButton variant="danger" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </AdminButton>
      </div>
    </Modal>
  );
}
