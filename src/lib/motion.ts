import type { Variants } from "framer-motion";

// Shared easing that matches the CSS --ease-lux curve.
export const easeLux = [0.22, 1, 0.36, 1] as const;
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeLux },
  },
};

/** Shorter travel — for dense grids where a 32px lift reads as jitter. */
export const fadeUpSm: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeLux },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: easeLux } },
};

/** Settles from a slight zoom — pairs with photography and stat tiles. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: easeOutExpo },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: easeLux } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: easeLux } },
};

// Parent that staggers its direct children (each using fadeUp/fadeIn).
export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

/** Tighter cadence for long lists — 12 items at 0.12s feels sluggish. */
export const staggerFast: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

// Clip-path image reveal.
export const imageReveal: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)", scale: 1.08 },
  show: {
    clipPath: "inset(0 0 0% 0)",
    scale: 1,
    transition: { duration: 1.1, ease: easeLux },
  },
};

/** Vertical curtain wipe — used for section headers over dark panels. */
export const curtainUp: Variants = {
  hidden: { y: "100%" },
  show: { y: "0%", transition: { duration: 1, ease: easeOutExpo } },
};

export const viewportOnce = { once: true, amount: 0.25 } as const;

/** For tall panels where 25% of the element is most of the viewport. */
export const viewportOnceLoose = { once: true, amount: 0.1 } as const;
