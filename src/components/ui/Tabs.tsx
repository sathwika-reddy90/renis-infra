"use client";

import { useCallback, useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  /** Stable identity — must be unique even when labels repeat. */
  value: string;
  label: string;
  /** Optional secondary line, e.g. an area or price. */
  hint?: string;
}

/**
 * Owns tab state and the ARIA id wiring for both the tablist and its panels,
 * so the two can never drift apart.
 *
 *   const tabs = useTabs(items);
 *   <Tabs {...tabs} />
 *   <div {...tabs.panelProps(item.value)}>…</div>
 */
export function useTabs(items: TabItem[], initial?: string) {
  const base = useId();
  const [value, setValue] = useState(initial ?? items[0]?.value ?? "");

  const tabId = useCallback((v: string) => `${base}-tab-${v}`, [base]);
  const panelId = useCallback((v: string) => `${base}-panel-${v}`, [base]);

  const panelProps = useCallback(
    (v: string) => ({
      role: "tabpanel" as const,
      id: panelId(v),
      "aria-labelledby": tabId(v),
      tabIndex: 0,
    }),
    [panelId, tabId],
  );

  return { items, value, onChange: setValue, tabId, panelId, panelProps };
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  tabId: (v: string) => string;
  panelId: (v: string) => string;
  className?: string;
  variant?: "pill" | "underline";
}

/**
 * Keyboard-accessible tab list: arrow keys, Home/End, roving tabindex.
 * Pair with `useTabs` — panels are rendered by the caller.
 */
export default function Tabs({
  items,
  value,
  onChange,
  tabId,
  panelId,
  className,
  variant = "pill",
}: TabsProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = items.findIndex((t) => t.value === value);
    if (i === -1) return;

    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;

    e.preventDefault();
    const target = items[next].value;
    onChange(target);
    refs.current[target]?.focus();
  }

  return (
    <div
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {items.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              refs.current[tab.value] = el;
            }}
            type="button"
            role="tab"
            id={tabId(tab.value)}
            aria-selected={active}
            aria-controls={panelId(tab.value)}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={cn(
              "cursor-pointer px-6 py-3 text-label uppercase transition-all duration-[var(--duration-base)] ease-[var(--ease-lux)]",
              variant === "pill" &&
                (active
                  ? "bg-ink text-white"
                  : "border border-line text-muted hover:border-gold hover:text-gold"),
              variant === "underline" &&
                (active
                  ? "border-b-2 border-gold text-ink"
                  : "border-b-2 border-transparent text-muted hover:text-ink"),
            )}
          >
            <span className="block">{tab.label}</span>
            {tab.hint && (
              <span
                className={cn(
                  "mt-1 block text-[0.65rem] normal-case tracking-[0.12em]",
                  active ? "text-white/60" : "text-muted-light",
                )}
              >
                {tab.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
