"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Skeleton from "@/components/ui/Skeleton";
import { useSiteContent } from "@/lib/query/hooks";

/*
 * Brand hero banner, hosted in the site's Supabase `uploads` bucket. This is
 * a fully composed 1920×1080 artwork — logo, headline, copy, CTA and icon
 * row are baked into the image itself — so the hero renders it as-is with no
 * overlay panel, no mirroring and no offset. On portrait screens the banner
 * letterboxes (object-contain) over the ink background so its text stays
 * readable instead of being cropped away.
 */
const HERO_IMAGE =
  "https://qoyyenhmwkcnvcbsultd.supabase.co/storage/v1/object/public/uploads/reneis%20main%20page%20.1.jpg";

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
          alt="RENIES INFRA — Hyderabad's premium projects, one destination"
          fill
          priority
          sizes="100vw"
          quality={90}
          // The artwork's text hugs its left edge, so anchor any cover-crop to
          // the left — whatever the aspect ratio, only the building side crops.
          className="hero-banner object-contain sm:object-cover sm:object-left"
        />
      </motion.div>
      {!reduced && (
        <motion.div style={{ opacity: veil }} className="absolute inset-0 bg-ink" aria-hidden />
      )}
    </>
  );

  // Reduced motion gets the same composition with no fixed layer and no
  // scroll-linked transforms — an ordinary full-bleed hero that scrolls away.
  if (reduced) {
    return (
      <section data-hero-dark className="relative h-screen w-full overflow-hidden bg-ink">
        {media}
      </section>
    );
  }

  return (
    <section data-hero-dark className="relative h-screen w-full">
      <motion.div style={{ visibility }} className="fixed inset-0 z-0 overflow-hidden bg-ink">
        {media}
      </motion.div>
    </section>
  );
}
