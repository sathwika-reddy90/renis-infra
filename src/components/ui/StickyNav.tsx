"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import Container from "@/components/ui/Container";

export interface StickyNavItem {
  /** Must match the target section's `id`. */
  id: string;
  label: string;
}

/**
 * Sticky in-page sub-navigation with scrollspy, for long project pages.
 *
 * Sections are observed rather than measured on scroll, so this stays cheap.
 * `rootMargin` biases the active band toward the upper third of the viewport
 * so the highlighted item matches what the reader is actually looking at.
 */
export default function StickyNav({
  items,
  className,
}: {
  items: StickyNavItem[];
  className?: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [items]);

  // Keep the active chip in view on mobile, where the bar scrolls horizontally.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-nav="${active}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label="Section navigation"
      className={cn(
        "sticky top-[72px] border-y border-line bg-white/95 backdrop-blur-md",
        className,
      )}
      style={{ zIndex: "var(--z-sticky)" }}
    >
      <Container>
        <div
          ref={listRef}
          className="no-scrollbar mask-edges-x flex gap-1 overflow-x-auto md:justify-center"
        >
          {items.map((item) => {
            const isActive = item.id === active;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                data-nav={item.id}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative whitespace-nowrap px-5 py-4 text-[0.72rem] uppercase tracking-[0.2em] transition-colors duration-[var(--duration-base)]",
                  isActive ? "text-gold" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-4 bottom-0 h-px bg-gold transition-opacity duration-[var(--duration-base)]",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                />
              </a>
            );
          })}
        </div>
      </Container>
    </nav>
  );
}
