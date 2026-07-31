"use client";

import type Lenis from "lenis";

/**
 * Module-level handle on the running Lenis instance.
 *
 * Overlays need to pause the virtual scroll while they are open: setting
 * `body { overflow: hidden }` stops the browser, but Lenis keeps advancing its
 * own position and snaps the page on close. Keeping the instance here avoids
 * threading it through context purely so a modal can call two methods, and
 * every consumer degrades to a no-op when it is absent (admin, reduced-motion,
 * server render).
 */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function stopLenis() {
  instance?.stop();
}

export function startLenis() {
  instance?.start();
}

/**
 * Jump to the top of the page.
 *
 * `window.scrollTo({ behavior: "smooth" })` no longer animates while Lenis is
 * running — Lenis disables native scroll-behaviour — and it leaves Lenis's
 * internal target stale, so the next wheel event snaps back to where the user
 * was. Route through Lenis when it exists, native otherwise.
 */
export function scrollToTop() {
  if (instance) {
    instance.scrollTo(0, { duration: 1 });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}
