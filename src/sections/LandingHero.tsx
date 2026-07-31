"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { easeLux } from "@/lib/motion";
import { useSiteContent } from "@/lib/query/hooks";

/**
 * Opening curtain.
 *
 * The visual layer is `fixed`, so the hero holds still at full bleed while the
 * rest of the page rides up and covers it — the reveal that makes the top of a
 * luxury site feel like a set change rather than a scroll. The outer `<section>`
 * stays in normal flow at exactly 100vh, which keeps two things honest: the
 * page is no longer than it looks, and the navbar's `data-hero-dark` observer
 * still stops matching once you've scrolled past the hero (a `sticky` element
 * would keep intersecting and strand the nav in white-on-white).
 *
 * Everything that moves is scroll-linked, not timed, so it tracks the pointer
 * exactly and reverses cleanly. Copy is CMS-managed via /admin/content.
 */
export default function LandingHero() {
  const { data, isPending } = useSiteContent();
  const reduced = useReducedMotion();
  const hero = data?.landingHero;

  const { scrollY } = useScroll();
  // Ranges are expressed in viewport heights, so the choreography holds from
  // a 640px phone to a 1440px desktop without per-breakpoint tuning.
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
  // Darkening as it is covered is what reads as depth — without it the hero
  // just sits there at full brightness behind a hole in the page.
  const veil = useTransform(scrollY, [0, range * 0.9], [0, 0.65]);
  // Copy leaves earlier and travels further than the image.
  const copyY = useTransform(scrollY, [0, range * 0.6], [0, -range * 0.14]);
  const copyOpacity = useTransform(scrollY, [0, range * 0.45], [1, 0]);
  const cueOpacity = useTransform(scrollY, [0, range * 0.15], [1, 0]);
  // Drop the composited layer — and its focusable CTA — once it is fully
  // buried, rather than leaving a full-screen fixed element live all page.
  const visibility = useTransform(scrollY, (v) =>
    v > range * 1.35 ? "hidden" : "visible",
  );

  if (isPending || !hero) {
    return <Skeleton className="h-screen w-full rounded-none" />;
  }

  const media = (
    <>
      <motion.div
        style={reduced ? undefined : { scale: imageScale, y: imageY }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src={hero.image}
          alt={hero.headline}
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 scrim-full" />
      {!reduced && (
        <motion.div style={{ opacity: veil }} className="absolute inset-0 bg-ink" aria-hidden />
      )}
    </>
  );

  const copy = (
    <Container className="relative z-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {hero.eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.2 }}
            className="eyebrow text-gold-soft"
          >
            {hero.eyebrow}
          </motion.p>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easeLux, delay: 0.35 }}
          className="mt-6 font-display text-display-1 text-white"
        >
          {hero.headline}
          {hero.headlineHighlight && (
            <>
              <br />
              <span className="italic text-gold-soft">{hero.headlineHighlight}</span>
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeLux, delay: 0.55 }}
          className="mt-7 max-w-xl text-body-lg text-white/80"
        >
          {hero.subheadline}
        </motion.p>

        {hero.cta?.label && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeLux, delay: 0.7 }}
            className="mt-10"
          >
            <Button href={hero.cta.href} variant="gold" size="lg">
              {hero.cta.label}
            </Button>
          </motion.div>
        )}
      </div>
    </Container>
  );

  // Reduced motion gets the same composition with no fixed layer and no
  // scroll-linked transforms — an ordinary full-bleed hero that scrolls away.
  if (reduced) {
    return (
      <section
        data-hero-dark
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
      >
        {media}
        {copy}
      </section>
    );
  }

  return (
    <section data-hero-dark className="relative h-screen w-full">
      <motion.div
        style={{ visibility }}
        className="fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
      >
        {media}

        <motion.div
          style={{ y: copyY, opacity: copyOpacity }}
          className="relative z-10 w-full will-change-transform"
        >
          {copy}
        </motion.div>

        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70"
          aria-hidden
        >
          <span className="text-[0.65rem] uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown size={18} className="animate-bounce" />
        </motion.div>
      </motion.div>
    </section>
  );
}
