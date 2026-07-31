"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Force GPU-composited transforms (translate3d/opacity) for every tween
  // driven by this hook — avoids any layout-triggering fallback during the
  // long, continuously-scrubbed pin interaction.
  gsap.config({ force3D: true });
}

export interface CinematicScrollRefs {
  section: RefObject<HTMLDivElement | null>;
  slides: RefObject<(HTMLDivElement | null)[]>;
  images: RefObject<(HTMLDivElement | null)[]>;
  texts: RefObject<(HTMLDivElement | null)[]>;
}

interface Options {
  /** Number of panels. The timeline rebuilds when this changes. */
  count: number;
  /**
   * Skip the pinned timeline entirely and show every panel statically.
   * Pass the result of framer-motion's `useReducedMotion()`.
   */
  disabled?: boolean;
}

/**
 * Pinned, scrubbed panel-stack storytelling.
 *
 * Each slide is a full-viewport panel. Panel 0 sits in place; every later
 * panel starts translated one full viewport-height below (out of view) and
 * slides straight up to cover the one beneath it — only one image ever
 * dominates the viewport, no side-by-side reveal. The image lives in its own
 * inner wrapper so it can carry a slow, independent Ken-Burns scale without
 * fighting the slide's own transform.
 *
 * Returns the refs to attach. Previously this ~90-line timeline was
 * copy-pasted verbatim into both Hero and ProjectShowcase; it lives here now
 * so there is exactly one implementation to tune.
 */
export function useCinematicScroll({ count, disabled = false }: Options): CinematicScrollRefs {
  const section = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLDivElement | null)[]>([]);
  const images = useRef<(HTMLDivElement | null)[]>([]);
  const texts = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const slideEls = slides.current.filter(Boolean) as HTMLDivElement[];
    const imageEls = images.current.filter(Boolean) as HTMLDivElement[];
    const textEls = texts.current.filter(Boolean) as HTMLDivElement[];

    // With motion reduced, present the last panel as a plain static hero
    // rather than pinning the page and hijacking the scroll.
    if (disabled) {
      if (slideEls.length === 0) return;
      gsap.set(slideEls, { yPercent: 0, autoAlpha: 0 });
      gsap.set(slideEls[0], { autoAlpha: 1 });
      gsap.set(imageEls, { scale: 1 });
      gsap.set(textEls, { autoAlpha: 0, y: 0 });
      gsap.set(textEls[0], { autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      if (slideEls.length < 2) return;

      gsap.set(slideEls[0], { yPercent: 0, autoAlpha: 1 });
      gsap.set(slideEls.slice(1), { yPercent: 100, autoAlpha: 0.92 });
      gsap.set(imageEls, { scale: 1.045, transformOrigin: "50% 50%" });
      gsap.set(imageEls[0], { scale: 1 });
      gsap.set(textEls[0], { autoAlpha: 1, y: 0 });
      gsap.set(textEls.slice(1), { autoAlpha: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${(slideEls.length - 1) * window.innerHeight * 1.3}`,
          // A higher scrub value is the actual source of the "momentum" — it
          // lets the animated playhead glide/catch up to the scroll position
          // over ~1.1s instead of snapping to it every frame.
          scrub: 1.1,
          pin: true,
          anticipatePin: 1,
        },
      });

      for (let i = 1; i < slideEls.length; i++) {
        const at = i - 1;
        tl
          // Primary cover transform — eased "none" on purpose: with scrub
          // already providing the smoothing/lag, an additional power-curve
          // here is what caused the mechanical "snap" at the end of each
          // transition. Letting scrub alone drive it keeps motion silky and
          // perfectly reversible on scroll-up.
          .to(slideEls[i], { yPercent: 0, ease: "none", duration: 1 }, at)
          // Soft opacity blend so the incoming panel's leading edge dissolves
          // in rather than reading as a hard-edged curtain.
          .fromTo(
            slideEls[i],
            { autoAlpha: 0.92 },
            { autoAlpha: 1, ease: "none", duration: 1 },
            at,
          )
          // Incoming image settles from a very slight zoom — a gentle "landing".
          .to(imageEls[i], { scale: 1, ease: "power2.out", duration: 1 }, at)
          // Outgoing image keeps drifting slowly as it's covered, for subtle
          // parallax depth rather than freezing dead the instant it's covered.
          .to(imageEls[i - 1], { scale: 1.03, ease: "none", duration: 1 }, at)
          .to(textEls[i - 1], { autoAlpha: 0, y: -24, ease: "power2.out", duration: 0.4 }, at)
          .to(textEls[i], { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.5 }, at + 0.5);
      }
    }, section);

    return () => ctx.revert();
  }, [count, disabled]);

  return { section, slides, images, texts };
}
