import type { Variants } from "framer-motion";

// Shared easing that matches the CSS --ease-lux curve.
export const easeLux = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeLux },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: easeLux } },
};

// Parent that staggers its direct children (each using fadeUp/fadeIn).
export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
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

export const viewportOnce = { once: true, amount: 0.25 } as const;
