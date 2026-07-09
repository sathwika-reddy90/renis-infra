"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

// Counts up the numeric portion of a stat (e.g. "3.2M", "6,500+") when in view.
export default function StatCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState("0");

  const match = value.match(/^([\d,.]+)(.*)$/);
  const target = match ? parseFloat(match[1].replace(/,/g, "")) : 0;
  const suffix = match ? match[2] : value;
  const decimals = match && match[1].includes(".") ? 1 : 0;

  useEffect(() => {
    if (!inView || !match) return;
    let frame = 0;
    const total = 48;
    const step = () => {
      frame++;
      const p = 1 - Math.pow(1 - frame / total, 3); // ease-out cubic
      const current = target * p;
      const formatted =
        decimals > 0
          ? current.toFixed(1)
          : Math.round(current).toLocaleString("en-IN");
      setDisplay(formatted);
      if (frame < total) requestAnimationFrame(step);
      else
        setDisplay(
          decimals > 0 ? target.toFixed(1) : target.toLocaleString("en-IN"),
        );
    };
    requestAnimationFrame(step);
  }, [inView, target, decimals, match]);

  return (
    <span ref={ref}>
      {match ? display : value}
      <span className="text-gold">{suffix}</span>
    </span>
  );
}
