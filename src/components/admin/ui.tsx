"use client";

import type { ComponentPropsWithRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/* --------------------------------- Buttons --------------------------------- */

type AdminButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: "gold" | "ghost" | "danger" | "dark";
  size?: "sm" | "md";
  loading?: boolean;
};

const VARIANTS: Record<NonNullable<AdminButtonProps["variant"]>, string> = {
  gold: "bg-gold text-white hover:bg-[#b7924b]",
  ghost: "border border-line text-ink hover:border-gold hover:text-gold",
  danger: "bg-red-600 text-white hover:bg-red-700",
  dark: "bg-ink text-white hover:bg-black",
};

export function AdminButton({
  variant = "gold",
  size = "md",
  loading = false,
  className,
  children,
  type = "button",
  disabled,
  ...rest
}: AdminButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium uppercase transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm"
          ? "px-3 py-2 text-[0.62rem] tracking-[0.16em]"
          : "px-5 py-2.5 text-[0.68rem] tracking-[0.18em]",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

export function IconButton({
  title,
  danger = false,
  className,
  children,
  ...rest
}: ComponentPropsWithRef<"button"> & { title: string; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center border border-line text-muted transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-35",
        danger ? "hover:border-red-500 hover:text-red-600" : "hover:border-gold hover:text-gold",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------------------------- Badge ---------------------------------- */

const TONES = {
  gold: "bg-gold/10 text-gold border-gold/30",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-600 border-red-200",
  blue: "bg-sky-50 text-sky-700 border-sky-200",
  neutral: "bg-cream text-muted border-line",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap border px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.14em]",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}
