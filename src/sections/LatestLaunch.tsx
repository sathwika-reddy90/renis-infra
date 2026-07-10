"use client";

import Image from "next/image";
import type { Variants } from "framer-motion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { useScheduleVisit } from "@/components/ScheduleVisitContext";
import { easeLux } from "@/lib/motion";
import { LATEST_LAUNCH } from "@/config/latestLaunch";

const panelReveal: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  show: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: easeLux } },
};

export default function LatestLaunch() {
  const { openVisitModal } = useScheduleVisit();

  return (
    <section id="latest-launch" className="bg-background py-24 md:py-32">
      <Container className="text-center">
        <Reveal>
          <span className="eyebrow flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            {LATEST_LAUNCH.eyebrow}
            <span className="h-px w-8 bg-gold" />
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-4xl font-light leading-[1.05] md:text-6xl">
            {LATEST_LAUNCH.name}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-3 text-[0.85rem] uppercase tracking-[0.2em] text-muted">
            {LATEST_LAUNCH.location}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-xl text-[1rem] leading-relaxed text-muted">
            {LATEST_LAUNCH.description}
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href={LATEST_LAUNCH.discoverHref} variant="gold">
              Discover Project
            </Button>
            <Button onClick={openVisitModal} variant="ghost">
              Register Interest
            </Button>
          </div>
        </Reveal>
      </Container>

      <Reveal
        variants={panelReveal}
        className="relative mx-auto mt-16 aspect-[16/9] w-full max-w-[1400px] overflow-hidden px-0 md:aspect-[21/9]"
      >
        <Image
          src={LATEST_LAUNCH.image}
          alt={LATEST_LAUNCH.name}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </Reveal>
    </section>
  );
}
