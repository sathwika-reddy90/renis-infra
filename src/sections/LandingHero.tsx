"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Skeleton from "@/components/ui/Skeleton";
import { useSiteContent } from "@/lib/query/hooks";

/*
 * Rooftop-pool-over-skyline hero image. The site's imagery is Unsplash-hosted
 * throughout (next.config allowlists images.unsplash.com); this is the closest
 * available match to the promo-hero composition: infinity pool, timber deck,
 * loungers and a high-rise skyline in daylight.
 */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1783667818798-38903081f98f?auto=format&fit=crop&w=2400&q=85";

/**
 * Opening curtain.
 *
 * The visual layer is `fixed`, so the hero holds still at full bleed while the
 * rest of the page rides up and covers it. The outer `<section>` stays in
 * normal flow at exactly 100vh. Everything that moves is scroll-linked, not
 * timed, so it tracks the pointer exactly and reverses cleanly.
 *
 * Composition: full-bleed image, blue promotional panel over the left ~41%,
 * promo copy centered inside the panel.
 */
export default function LandingHero() {
  const { isPending } = useSiteContent();
  const reduced = useReducedMotion();

  const { scrollY } = useScroll();
  const [vh, setVh] = useState(0);

  useEffect(() => {
    const measure = () => setVh(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const range = vh || 800;

  // The image recedes: pushes back and drifts up behind the incoming section.
  const imageScale = useTransform(scrollY, [0, range], [1, 1.15]);
  const imageY = useTransform(scrollY, [0, range], [0, -range * 0.05]);
  // Darkening as it is covered is what reads as depth.
  const veil = useTransform(scrollY, [0, range * 0.9], [0, 0.65]);
  const visibility = useTransform(scrollY, (v) =>
    v > range * 1.35 ? "hidden" : "visible",
  );

  if (isPending) {
    return <Skeleton className="h-screen w-full rounded-none" />;
  }

  const media = (
    <>
      <motion.div
        style={reduced ? undefined : { scale: imageScale, y: imageY }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src={HERO_IMAGE}
          alt="Rooftop infinity pool overlooking the city skyline"
          fill
          priority
          sizes="100vw"
          quality={90}
          // Mirrored so the skyline reads on the open right half, matching the
          // reference composition (promo panel left, towers right).
          className="-scale-x-100 object-cover object-[38%_center]"
        />
      </motion.div>
      {!reduced && (
        <motion.div style={{ opacity: veil }} className="absolute inset-0 bg-ink" aria-hidden />
      )}
    </>
  );

  /* Blue promotional panel — left portion of the hero, per the reference. */
  const panel = (
    <div className="absolute inset-y-0 left-0 z-10 flex w-full items-center justify-center bg-gradient-to-b from-[#2d7fae]/95 via-[#226d9c]/95 to-[#175a86]/95 px-8 pt-20 sm:w-[75%] md:w-[55%] lg:w-[41%]">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <p className="font-script text-[3.2rem] leading-[0.9] text-white md:text-[3.6rem]">
          Summer
        </p>
        <h1 className="mt-1 font-display text-[3.2rem] font-bold uppercase leading-none tracking-[0.02em] text-white md:text-[4rem]">
          Bonanza
        </h1>
        <p className="mt-5 text-[1rem] font-semibold uppercase tracking-[0.14em] text-white md:text-[1.15rem]">
          Own Your Dubai Address
        </p>

        <div className="mt-9 flex w-full items-stretch justify-center gap-5">
          <div className="flex w-[12rem] flex-col items-center justify-center rounded-xl bg-white px-4 py-4">
            <span className="text-[2rem] font-extrabold leading-tight text-[#12263c]">
              0.5<span className="align-top text-[1.2rem]">%</span>
            </span>
            <span className="text-[1rem] font-bold uppercase leading-snug text-[#12263c]">
              Pay Monthly
            </span>
          </div>
          <div className="flex w-[12rem] flex-col items-center justify-center rounded-xl bg-white px-4 py-4">
            <span className="text-[2rem] font-extrabold leading-tight text-[#12263c]">40/60</span>
            <span className="text-[1rem] font-bold uppercase leading-snug text-[#12263c]">
              Payment Plan
            </span>
          </div>
        </div>

        <p className="mt-8 text-[1.05rem] uppercase tracking-[0.08em] text-white">
          <span className="font-bold">10%</span>{" "}
          <span className="font-medium">Down Payment</span>
        </p>

        <Link
          href="/contact"
          className="mt-9 inline-flex h-[3.5rem] w-[18rem] max-w-full items-center justify-center rounded-full bg-[#c9a878] text-[0.95rem] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-[var(--duration-base)] hover:bg-[#b8975f]"
        >
          Register Now
        </Link>
      </div>
    </div>
  );

  // Reduced motion gets the same composition with no fixed layer and no
  // scroll-linked transforms — an ordinary full-bleed hero that scrolls away.
  if (reduced) {
    return (
      <section data-hero-dark className="relative h-screen w-full overflow-hidden">
        {media}
        {panel}
      </section>
    );
  }

  return (
    <section data-hero-dark className="relative h-screen w-full">
      <motion.div style={{ visibility }} className="fixed inset-0 z-0 overflow-hidden">
        {media}
        {panel}
      </motion.div>
    </section>
  );
}
