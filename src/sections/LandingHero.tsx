"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Building, Building2, ChevronRight, Handshake, MapPin } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { useSiteContent } from "@/lib/query/hooks";

/** The banner artwork's own gold, sampled from it so the phone copy matches. */
const BANNER_GOLD = "#dca050";

const FEATURES = [
  { icon: Building2, label: "Premium Developers" },
  { icon: MapPin, label: "Curated Projects" },
  { icon: Building, label: "Trusted Guidance" },
  { icon: Handshake, label: "Relationships" },
];

/**
 * Phone composition. The banner's copy is baked into its left half, which a
 * phone can't show legibly, so on phones that half stays off-screen (see
 * `.landing-hero` in globals.css) and the same copy is set as real text over
 * the building side: headline over the dusk sky, the rest at the foot of the
 * first screen, the four features in a 2×2 grid below. Hidden elsewhere.
 */
function MobileCopy() {
  return (
    <div className="landing-hero-copy">
      <div className="landing-hero-copy__screen flex min-h-[100svh] flex-col px-6 pb-10 pt-[calc(4.5rem+2.25rem)] md:px-10">
        <h1 className="max-w-[22rem] text-balance text-[clamp(1.6rem,7.6vw,2.75rem)] font-medium uppercase leading-[1.12] text-white [font-family:var(--font-display),serif] [text-shadow:0_2px_18px_rgb(11_23_48/0.75)] md:max-w-[34rem]">
          Hyderabad&apos;s Premium Projects.
          <span className="mt-1 block" style={{ color: BANNER_GOLD }}>
            One Destination.
          </span>
        </h1>

        <div className="mt-auto pt-10">
          <span className="relative block h-px w-[72px]" style={{ backgroundColor: BANNER_GOLD }} aria-hidden>
            <span
              className="absolute left-[26px] top-[-2px] block h-[5px] w-[5px] rounded-full"
              style={{ backgroundColor: BANNER_GOLD }}
            />
          </span>
          <p className="mt-5 max-w-[21rem] text-[15px] leading-[1.6] text-white/90 [font-family:var(--font-sans),sans-serif]">
            From landmark developments to exceptional spaces, Renies Infra brings you a curated
            portfolio from leading developers
          </p>
          <Link
            href="/projects"
            className="mt-7 inline-flex min-h-12 items-center gap-3 border px-5 py-3 text-[13px] font-medium uppercase tracking-[0.06em] [font-family:var(--font-sans),sans-serif] max-[360px]:gap-2 max-[360px]:px-4 max-[360px]:text-[12px]"
            style={{ borderColor: BANNER_GOLD, color: BANNER_GOLD }}
          >
            Explore Premium Projects
            <ChevronRight size={18} strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      </div>

      <ul className="landing-hero-copy__features grid grid-cols-2 gap-y-8 px-6 pb-14 pt-4 md:px-10">
        {FEATURES.map(({ icon: Icon, label }, i) => (
          <li
            key={label}
            className="flex flex-col items-center gap-3 px-3 text-center"
            style={i % 2 ? { borderLeft: `1px solid ${BANNER_GOLD}59` } : undefined}
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full border"
              style={{ borderColor: BANNER_GOLD, color: BANNER_GOLD }}
            >
              <Icon size={24} strokeWidth={1.25} aria-hidden />
            </span>
            <span className="max-w-[7.5rem] text-[12px] font-medium uppercase leading-snug tracking-[0.04em] text-white [font-family:var(--font-sans),sans-serif]">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/*
 * Brand hero banner, hosted in the site's Supabase `uploads` bucket. This is
 * a fully composed 1920×1080 artwork — logo, headline, copy, CTA and icon
 * row are baked into the image itself — so the hero renders it as-is with no
 * overlay panel, no mirroring and no offset. Phones get their own composition
 * (see MobileCopy below) and portrait tablets a band under the header — see
 * `.landing-hero` in globals.css.
 */
const HERO_IMAGE =
  "https://qoyyenhmwkcnvcbsultd.supabase.co/storage/v1/object/public/uploads/renies-hero-banner-v3.jpg";

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
        className="landing-hero-media absolute inset-0 will-change-transform"
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
      <section data-hero-dark className="landing-hero relative h-screen w-full overflow-hidden bg-ink">
        {media}
        <MobileCopy />
      </section>
    );
  }

  return (
    <section data-hero-dark className="landing-hero relative h-screen w-full">
      <motion.div style={{ visibility }} className="fixed inset-0 z-0 overflow-hidden bg-ink">
        {media}
      </motion.div>
      <MobileCopy />
    </section>
  );
}
