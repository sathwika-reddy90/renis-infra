"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * Scroll-linked depth.
 *
 * Progress is measured across the element's whole pass through the viewport
 * ("start end" → "end start"), so the effect is continuous rather than a
 * one-shot trigger, and it reverses exactly on scroll-up. Paired with the
 * site's smooth scroll, this is what stops big photography from feeling like
 * it is glued to the page.
 */

interface ParallaxImageProps {
  src: string;
  alt: string;
  /** Vertical drift as a percentage of frame height, each direction. */
  speed?: number;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}

export function ParallaxImage({
  src,
  alt,
  speed = 10,
  className,
  imageClassName,
  sizes = "100vw",
  priority = false,
  quality = 90,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Drifts downward as the page scrolls up, so the image trails the frame.
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed}%`, `${speed}%`]);

  // The inner layer is oversized by exactly the travel distance, top and
  // bottom, so drifting never exposes an edge of the frame.
  const overscan = reduced ? 0 : speed;

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        style={
          reduced
            ? undefined
            : { y, top: `-${overscan}%`, height: `${100 + overscan * 2}%` }
        }
        className={cn("absolute inset-x-0", reduced && "inset-y-0", "will-change-transform")}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          className={cn("object-cover", imageClassName)}
        />
      </motion.div>
    </div>
  );
}

interface ParallaxProps {
  children: React.ReactNode;
  /** Pixels of travel, each direction. Negative moves against the scroll. */
  distance?: number;
  className?: string;
}

/** Same idea for arbitrary content — floating captions, offset stat cards. */
export function Parallax({ children, distance = 60, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
