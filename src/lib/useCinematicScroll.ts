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
 * Pinned, scrubbed stacked-page storytelling.
 *
 * Every slide is a full-viewport panel occupying the exact same box, stacked
 * like sheets of paper — panel 0 on top, each later panel already sitting
 * directly underneath it, in its final position, from the very first frame
 * (the z-index ladder lives in Hero). Nothing is hidden, clipped or faded:
 * a lower panel is simply covered by the one above it.
 *
 * A transition translates the *outgoing* panel straight up and off screen
 * (`yPercent: 0` → `-100`). The incoming panel never moves at all — it is
 * uncovered, the way lifting the top sheet off a stack uncovers the next.
 *
 * Crucially, the outgoing panel's image counter-translates downward by the
 * exact same amount (`yPercent: 0` → `+100`, same slot/duration/ease), which
 * cancels the panel's motion in screen space. The photograph therefore does
 * not move or reframe by a single pixel while its panel slides away: the
 * panel is a window, and only the window travels. Without this the visible
 * slice of a rigidly-translated panel would be its *bottom* half, which
 * reads as the image being cropped and shoved upward mid-transition.
 *
 * So at 50% the viewport's top half holds the outgoing image's top half,
 * still at its natural framing, and the bottom half holds the incoming
 * image's bottom half, equally untouched.
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
      gsap.set(slideEls, { yPercent: 0, clipPath: "none", autoAlpha: 0 });
      gsap.set(slideEls[0], { autoAlpha: 1 });
      gsap.set(imageEls, { yPercent: 0, scale: 1 });
      gsap.set(textEls, { autoAlpha: 0, y: 0 });
      gsap.set(textEls[0], { autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      if (slideEls.length < 2) return;

      // Every panel starts in its final resting position, fully opaque and
      // unclipped — including the ones further down the stack. They are not
      // waiting off screen to slide in; they are already there, underneath.
      gsap.set(slideEls, { yPercent: 0, clipPath: "none", autoAlpha: 1 });
      gsap.set(imageEls, { yPercent: 0, scale: 1.045, transformOrigin: "50% 50%" });
      gsap.set(imageEls[0], { scale: 1 });
      gsap.set(textEls[0], { autoAlpha: 1, y: 0 });
      gsap.set(textEls.slice(1), { autoAlpha: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          // 1 viewport-height of scroll per transition — a 1:1 mapping, so a
          // panel travels exactly as far as you scroll, like a real page.
          // The previous 1.3 stretched each transition over 130% of a screen,
          // which is what made a small scroll produce only a small, sluggish-
          // looking amount of movement.
          end: () => `+=${(slideEls.length - 1) * window.innerHeight}`,
          // `true` ties the timeline's playhead exactly to scroll position,
          // recalculated every frame — no catch-up glide, no waiting for a
          // tween to finish. Every pixel scrolled maps straight to progress.
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });

      for (let i = 1; i < slideEls.length; i++) {
        const at = i - 1;
        tl
          // The top page translates straight up and off, uncovering the page
          // already sitting underneath. The incoming panel is never touched —
          // no move, no clip, no fade — so it holds its natural framing the
          // whole way. Eased "none" on purpose: with scrub already providing
          // the smoothing, an additional power-curve here is what caused the
          // mechanical "snap" at the end of each transition.
          .to(slideEls[i - 1], { yPercent: -100, ease: "none", duration: 1 }, at)
          // Incoming image settles from a very slight zoom — a gentle "landing".
          .to(imageEls[i], { scale: 1, ease: "power2.out", duration: 1 }, at)
          // Counter-translate that holds the outgoing photograph perfectly
          // still on screen while its panel slides out from around it. Must
          // stay in lockstep with the panel tween above — same slot, same
          // duration, same "none" ease — or the image drifts instead of
          // staying pinned. (The 1.03 scale is the pre-existing Ken-Burns
          // drift, left untouched.)
          .to(
            imageEls[i - 1],
            { yPercent: 100, scale: 1.03, ease: "none", duration: 1 },
            at,
          )
          .to(textEls[i - 1], { autoAlpha: 0, y: -24, ease: "power2.out", duration: 0.4 }, at)
          .to(textEls[i], { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.5 }, at + 0.5);
      }

      // Only the two panels taking part in the current transition can ever be
      // seen — everything below the incoming panel is fully covered by it,
      // everything above the outgoing one has already left the screen. But
      // with force3D + will-change, every stacked panel otherwise keeps ~4
      // full-viewport composited layers resident for the whole pin, and past
      // roughly 8 panels the compositor starts evicting and re-rasterizing
      // tiles mid-scroll, which reads as flicker. Hiding the provably
      // invisible panels (with a one-panel safety margin for fast scrubbing)
      // releases those layers without changing a single visible pixel.
      let visLo = -1;
      let visHi = -1;
      const applyVisibilityWindow = () => {
        const t = tl.progress() * (slideEls.length - 1);
        const lo = Math.max(0, Math.floor(t) - 1);
        const hi = Math.min(slideEls.length - 1, Math.floor(t) + 2);
        if (lo === visLo && hi === visHi) return;
        visLo = lo;
        visHi = hi;
        for (let j = 0; j < slideEls.length; j++) {
          slideEls[j].style.visibility = j < lo || j > hi ? "hidden" : "";
        }
      };
      tl.eventCallback("onUpdate", applyVisibilityWindow);
      applyVisibilityWindow();
    }, section);

    return () => ctx.revert();
  }, [count, disabled]);

  return { section, slides, images, texts };
}
