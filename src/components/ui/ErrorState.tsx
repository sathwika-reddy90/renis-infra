"use client";

import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";

// Graceful failure UI with a retry action. Kept visually quiet to fit any section.
export default function ErrorState({
  message = "We couldn't load this content right now.",
  onRetry,
  invert = false,
}: {
  message?: string;
  onRetry?: () => void;
  invert?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <p className={cn("text-[0.95rem]", invert ? "text-white/70" : "text-muted")}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            "group inline-flex items-center gap-2 border px-6 py-3 text-[0.75rem] uppercase tracking-[0.2em] transition-colors duration-300",
            invert
              ? "border-white/40 text-white hover:border-gold hover:text-gold"
              : "border-line text-ink hover:border-gold hover:text-gold",
          )}
        >
          <RefreshCw size={15} className="transition-transform duration-500 group-hover:rotate-180" />
          Retry
        </button>
      )}
    </div>
  );
}
