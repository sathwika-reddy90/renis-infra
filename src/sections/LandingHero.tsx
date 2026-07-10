"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { easeLux } from "@/lib/motion";
import { LANDING_HERO } from "@/config/landingHero";

// Brand-new fullscreen landing hero, sitting above the existing
// Entrance/Villa/Balcony/Exterior GSAP storytelling hero. Static image,
// everything centered — deliberately simple next to the scroll-driven one.
export default function LandingHero() {
  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <Image
        src={LANDING_HERO.image}
        alt={LANDING_HERO.headline}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60" />

      <Container className="relative z-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.2 }}
            className="eyebrow text-gold-soft"
          >
            {LANDING_HERO.location}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easeLux, delay: 0.35 }}
            className="mt-6 font-display text-5xl font-light leading-[1.05] text-white md:text-7xl"
          >
            {LANDING_HERO.headline}
            <br />
            <span className="italic text-gold-soft">{LANDING_HERO.headlineHighlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeLux, delay: 0.55 }}
            className="mt-7 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
          >
            {LANDING_HERO.subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeLux, delay: 0.7 }}
            className="mt-10"
          >
            <Button href={LANDING_HERO.cta.href} variant="gold">
              {LANDING_HERO.cta.label}
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
