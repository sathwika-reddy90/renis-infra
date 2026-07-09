"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { cn } from "@/lib/cn";

type Ripple = { id: number; x: number; y: number };

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "gold" | "outline" | "ghost";
  className?: string;
};

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden " +
  "px-8 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.22em] " +
  "transition-colors duration-500 ease-[var(--ease-lux)] cursor-pointer select-none";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  gold: "bg-gold text-white hover:bg-[#b7924b]",
  outline:
    "border border-white/40 text-white hover:border-white hover:bg-white/5",
  ghost: "border border-line text-ink hover:border-gold hover:text-gold",
};

export default function Button({
  children,
  href,
  onClick,
  variant = "gold",
  className,
}: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  function spawnRipple(e: MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [
      ...r,
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
    ]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 650);
    onClick?.();
  }

  const content = (
    <>
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute z-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 animate-[ripple_0.65s_ease-out]"
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </>
  );

  const classes = cn(base, variants[variant], className);

  if (href) {
    // Internal routes use client-side navigation; hash/external stay as <a>.
    const isRoute = href.startsWith("/");
    if (isRoute) {
      return (
        <Link href={href} onClick={spawnRipple} className={classes}>
          {content}
        </Link>
      );
    }
    return (
      <a href={href} onClick={spawnRipple} className={classes}>
        {content}
      </a>
    );
  }
  return (
    <button onClick={spawnRipple} className={classes}>
      {content}
    </button>
  );
}
