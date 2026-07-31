"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export interface AdminTab {
  value: string;
  label: string;
  /** Optional count/marker, e.g. number of items in the group. */
  badge?: string | number;
}

/**
 * Horizontal tab strip for long admin forms. Keyboard-navigable, with roving
 * tabindex. Panels are rendered by the caller and should carry
 * `role="tabpanel"`.
 */
export default function AdminTabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: AdminTab[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = tabs.findIndex((t) => t.value === value);
    if (i === -1) return;

    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;

    e.preventDefault();
    const target = tabs[next].value;
    onChange(target);
    refs.current[target]?.focus();
  }

  return (
    <div
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn("flex gap-1 overflow-x-auto border-b border-line", className)}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              refs.current[tab.value] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative flex-none whitespace-nowrap px-4 py-3 text-[0.68rem] uppercase tracking-[0.16em] transition-colors",
              active ? "text-gold" : "text-muted hover:text-ink",
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className="ml-1.5 text-[0.6rem] text-muted-light">({tab.badge})</span>
            )}
            <span
              className={cn(
                "absolute inset-x-2 -bottom-px h-px bg-gold transition-opacity",
                active ? "opacity-100" : "opacity-0",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
