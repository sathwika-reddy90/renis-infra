"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Ripple = { id: number; x: number; y: number };

type Variant = "gold" | "champagne" | "outline" | "outline-dark" | "ghost" | "ink" | "link";
type Size = "sm" | "md" | "lg";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  /** Rendered before the label — pairs with lucide icons. */
  icon?: React.ReactNode;
  /** Rendered after the label. */
  iconAfter?: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden " +
  "font-semibold uppercase tracking-[0.22em] " +
  "transition-colors duration-[var(--duration-slow)] ease-[var(--ease-lux)] " +
  "cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-55";

const SIZES: Record<Size, string> = {
  sm: "px-5 py-2.5 text-[0.7rem]",
  md: "px-8 py-3.5 text-[0.78rem]",
  lg: "px-10 py-4.5 text-[0.82rem]",
};

const VARIANTS: Record<Variant, string> = {
  gold: "bg-gold text-white hover:bg-gold-deep",
  champagne: "bg-[#bda588] text-white hover:bg-[#a8916f]",
  ink: "bg-ink text-white hover:bg-ink-800",
  // For dark backgrounds / photography.
  outline: "border border-white/40 text-white hover:border-white hover:bg-white/10",
  // For light backgrounds — the original `outline` was white-only and unusable here.
  "outline-dark": "border border-ink/25 text-ink hover:border-gold hover:text-gold",
  ghost: "border border-line text-ink hover:border-gold hover:text-gold",
  link: "px-0 py-0 text-gold hover:text-gold-deep",
};

export default function Button({
  children,
  href,
  onClick,
  variant = "gold",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  icon,
  iconAfter,
  className,
  ...rest
}: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const inert = disabled || loading;

  function spawnRipple(e: MouseEvent<HTMLElement>) {
    if (inert) {
      e.preventDefault();
      return;
    }
    if (variant !== "link") {
      const rect = e.currentTarget.getBoundingClientRect();
      const id = Date.now();
      setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 650);
    }
    onClick?.();
  }

  const content = (
    <>
      <span className="relative z-10 inline-flex items-center gap-2">
        {loading ? <Loader2 size={15} className="animate-spin" aria-hidden /> : icon}
        {children}
        {iconAfter}
      </span>
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden
          className="pointer-events-none absolute z-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 animate-[ripple_0.65s_ease-out]"
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </>
  );

  const classes = cn(
    base,
    variant !== "link" && SIZES[size],
    VARIANTS[variant],
    className,
  );

  if (href && !inert) {
    // Internal routes use client-side navigation; hash/external stay as <a>.
    if (href.startsWith("/")) {
      return (
        <Link href={href} onClick={spawnRipple} className={classes} {...rest}>
          {content}
        </Link>
      );
    }
    return (
      <a href={href} onClick={spawnRipple} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={inert}
      aria-busy={loading || undefined}
      onClick={spawnRipple}
      className={classes}
      {...rest}
    >
      {content}
    </button>
  );
}
