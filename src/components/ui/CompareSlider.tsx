"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * Draggable before/after image comparison.
 *
 * Position is tracked entirely in a Framer Motion value (pixels from the
 * left edge), never React state — `useTransform` derives the clip-path and
 * handle transform from it, so a drag that crosses the whole width repaints
 * without a single React re-render. The container's `getBoundingClientRect`
 * is read once per drag (on pointerdown) and cached, not on every
 * pointermove, since a synchronous layout read on every move is the usual
 * reason these sliders stutter. Pointer Events + `setPointerCapture` cover
 * mouse, touch and pen with one code path, and keep tracking the handle even
 * once the pointer leaves the element — the divider never "escapes" the
 * cursor on a fast flick.
 */

interface CompareImage {
  src: string;
  alt: string;
}

interface CompareSliderProps {
  before: CompareImage;
  after: CompareImage;
  /** Starting position, 0–100. */
  initialPercent?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  "aria-label"?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function CompareSlider({
  before,
  after,
  initialPercent = 50,
  className,
  sizes = "100vw",
  priority = false,
  "aria-label": ariaLabel = "Image comparison slider",
}: CompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ left: 0, width: 0, dragging: false });
  const activePointerRef = useRef<{
    el: HTMLDivElement;
    move: (e: PointerEvent) => void;
    up: (e: PointerEvent) => void;
  } | null>(null);
  const reduced = useReducedMotion();

  // Pixel offset from the container's left edge. Written directly via
  // `.set()` on every pointermove — no setState, so no re-render, no diffing.
  const x = useMotionValue(0);

  // Both derived values are compositor-friendly: `x` becomes a translateX
  // transform on the handle (via the `style={{ x }}` shorthand below), and
  // clip-path never touches layout the way animating `left`/`width` would.
  const clipPath = useTransform(x, (v) => {
    const width = dragRef.current.width || 1;
    const revealed = clamp((v / width) * 100, 0, 100);
    return `inset(0 ${100 - revealed}% 0 0)`;
  });

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { left: 0, width: 0 };
    const rect = el.getBoundingClientRect();
    return { left: rect.left, width: rect.width };
  }, []);

  // Initial placement + keep the divider at the same relative position
  // across resizes (orientation change, sidebar toggle, etc.).
  useEffect(() => {
    const { width } = measure();
    dragRef.current.width = width;
    x.set((initialPercent / 100) * width);

    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const newWidth = entry.contentRect.width;
      const oldWidth = dragRef.current.width || newWidth;
      if (oldWidth > 0) x.set((x.get() / oldWidth) * newWidth);
      dragRef.current.width = newWidth;
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mirrors the live value onto the DOM for assistive tech without a
  // React re-render — motion values support side-effect subscriptions.
  useEffect(() => {
    const unsubscribe = x.on("change", (v) => {
      const width = dragRef.current.width || 1;
      handleRef.current?.setAttribute("aria-valuenow", String(Math.round((v / width) * 100)));
    });
    return unsubscribe;
  }, [x]);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const { left, width } = dragRef.current;
      x.set(clamp(clientX - left, 0, width));
    },
    [x],
  );

  // Ends the drag and tears down the listeners started in handlePointerDown.
  // The value is left exactly where the pointer released it — no settle,
  // no snap-back, no animation of any kind.
  const stopDrag = useCallback((el: HTMLDivElement, pointerId: number) => {
    const active = activePointerRef.current;
    if (!active) return;
    el.removeEventListener("pointermove", active.move);
    el.removeEventListener("pointerup", active.up);
    el.removeEventListener("pointercancel", active.up);
    if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
    activePointerRef.current = null;
    dragRef.current.dragging = false;
    // Layer no longer needs to stay compositor-promoted once idle.
    if (clipRef.current) clipRef.current.style.willChange = "";
  }, []);

  // Only the low-frequency pointerdown goes through React's synthetic event
  // system. The hot path — pointermove, fired dozens of times per drag — is
  // wired up here as a *native* listener attached directly to the element,
  // and only for the drag's duration. That skips React's SyntheticEvent
  // allocation and simulated bubble dispatch on every sample, and means
  // there's no listener sitting active (and being needlessly dispatched to)
  // while the user is merely hovering, not dragging.
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const { left, width } = measure();
      dragRef.current = { left, width, dragging: true };
      el.setPointerCapture(e.pointerId);
      // Promote the clipped image layer ahead of the first paint, so the
      // opening frame of the drag doesn't pay a layer-creation cost.
      if (clipRef.current) clipRef.current.style.willChange = "clip-path";
      updateFromClientX(e.clientX);

      const move = (ev: PointerEvent) => updateFromClientX(ev.clientX);
      const up = (ev: PointerEvent) => stopDrag(el, ev.pointerId);
      el.addEventListener("pointermove", move, { passive: true });
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
      activePointerRef.current = { el, move, up };
    },
    [measure, updateFromClientX, stopDrag],
  );

  // Safety net: if the component unmounts mid-drag, drop the native
  // listeners instead of leaking them.
  useEffect(() => {
    return () => {
      const active = activePointerRef.current;
      if (!active) return;
      active.el.removeEventListener("pointermove", active.move);
      active.el.removeEventListener("pointerup", active.up);
      active.el.removeEventListener("pointercancel", active.up);
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const { width } = dragRef.current;
      if (!width) return;
      const step = ((e.shiftKey ? 10 : 2) / 100) * width;
      if (e.key === "ArrowLeft") {
        x.set(clamp(x.get() - step, 0, width));
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        x.set(clamp(x.get() + step, 0, width));
        e.preventDefault();
      } else if (e.key === "Home") {
        x.set(0);
        e.preventDefault();
      } else if (e.key === "End") {
        x.set(width);
        e.preventDefault();
      }
    },
    [x],
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative touch-none select-none overflow-hidden", className)}
      onPointerDown={handlePointerDown}
    >
      {/* After — full-bleed base layer. */}
      <Image
        src={after.src}
        alt={after.alt}
        fill
        sizes={sizes}
        priority={priority}
        draggable={false}
        className="pointer-events-none select-none object-cover"
      />

      {/* Before — clipped to the revealed region, left of the divider. */}
      <motion.div ref={clipRef} className="absolute inset-0" style={{ clipPath }}>
        <Image
          src={before.src}
          alt={before.alt}
          fill
          sizes={sizes}
          priority={priority}
          draggable={false}
          className="pointer-events-none select-none object-cover"
        />
      </motion.div>

      {/* Divider + handle. `x` renders as a GPU-composited translateX. */}
      <motion.div className="absolute inset-y-0 left-0 w-px bg-white/80 will-change-transform" style={{ x }}>
        <motion.div
          ref={handleRef}
          role="slider"
          tabIndex={0}
          aria-label={ariaLabel}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={initialPercent}
          onKeyDown={handleKeyDown}
          whileHover={reduced ? undefined : { scale: 1.08 }}
          whileTap={reduced ? undefined : { scale: 1.15, boxShadow: "0 0 0 10px rgba(255,255,255,0.15)" }}
          transition={{ duration: 0 }}
          className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M5 3 1 8l4 5M11 3l4 5-4 5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
