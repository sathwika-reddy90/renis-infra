"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

// Counts up the numeric portion of a stat (e.g. "3.2M", "6,500+") when in view.
export default function StatCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState("0");

  const match = value.match(/^([\d,.]+)(.*)$/);
  // Depend on the numeric substring itself (a stable primitive), not the
  // `match` array — `.match()` returns a new array identity on every
  // render, which previously re-ran the effect (and started a new,
  // uncancelled rAF loop) on every re-render of the page, not just once.
  // With enough re-renders, dozens of competing loops end up writing to
  // the same `display` state simultaneously, which is what showed up as
  // flickering/"doubled" digits on the live page (a single screenshot
  // only ever catches one frame of that race, so it looked fine there).
  const numeric = match?.[1] ?? null;
  const suffix = match ? match[2] : value;
  const decimals = numeric?.includes(".") ? 1 : 0;
  const target = numeric ? parseFloat(numeric.replace(/,/g, "")) : 0;

  useEffect(() => {
    if (!inView || numeric === null) return;
    let cancelled = false;
    let frameId = 0;
    let frame = 0;
    const total = 48;
    const step = () => {
      if (cancelled) return;
      frame++;
      const p = 1 - Math.pow(1 - frame / total, 3); // ease-out cubic
      const current = target * p;
      const formatted =
        decimals > 0
          ? current.toFixed(1)
          : Math.round(current).toLocaleString("en-IN");
      setDisplay(formatted);
      if (frame < total) {
        frameId = requestAnimationFrame(step);
      } else {
        setDisplay(
          decimals > 0 ? target.toFixed(1) : target.toLocaleString("en-IN"),
        );
      }
    };
    frameId = requestAnimationFrame(step);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [inView, numeric, target, decimals]);

  return (
    <span ref={ref} className="tabular-nums antialiased">
      {numeric !== null ? display : value}
      <span className="text-gold">{suffix}</span>
    </span>
  );
}
