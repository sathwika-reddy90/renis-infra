"use client";

import { useEffect, useSyncExternalStore } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/lib/lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Inertial smooth scrolling for the public site.
 *
 * This is the single biggest contributor to how "expensive" the page feels:
 * the wheel drives a virtual position that eases toward the target instead of
 * jumping, so every parallax, pin and reveal downstream inherits the same
 * glide. Mounted in the (site) layout only — the admin keeps native scroll,
 * where precision beats polish.
 *
 * Touch is deliberately left native (`syncTouch` off). Hijacking momentum
 * scrolling on a phone reads as lag, not luxury, and fights the OS.
 */
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(REDUCED_MOTION).matches;
// Lenis only ever starts client-side, so the server value is irrelevant —
// it just has to be stable to avoid a hydration mismatch.
const getServerSnapshot = () => false;

export default function SmoothScroll() {
  // Subscribed rather than read once, so toggling the OS setting takes effect
  // without a reload.
  const reduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      // ~0.9s to settle. Long enough to read as momentum, short enough that
      // the page never feels like it is lagging behind the wheel.
      duration: 0.9,
      // Matches --ease-lux, so JS-driven and CSS-driven motion share a curve.
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      syncTouch: false,
      // Lenis owns in-page anchor navigation; the CSS `scroll-behavior` is
      // disabled while it runs, so without this every #hash link would jump.
      anchors: { offset: -96 },
      // Overflow panes (the mobile menu, lightbox thumbnail rails, modal
      // bodies) opt out by marking themselves, so their inner scroll works.
      prevent: (node) => node.hasAttribute?.("data-lenis-prevent") ?? false,
      // GSAP's ticker drives the loop instead, so pinned timelines and the
      // scroll position advance in the same frame — driving them from two
      // independent rAF loops is what produces pin jitter.
      autoRaf: false,
    });

    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // Lag smoothing pauses the ticker after a slow frame, which would strand
    // Lenis mid-tween on heavy pages.
    gsap.ticker.lagSmoothing(0);

    // Late-loading imagery changes document height; without this, triggers
    // measured on mount stay wrong.
    ScrollTrigger.refresh();

    return () => {
      setLenis(null);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
