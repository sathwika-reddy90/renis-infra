"use client";

import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { useScheduleVisit } from "@/components/ScheduleVisitContext";
import { LATEST_LAUNCH } from "@/config/latestLaunch";

// New top-of-page launch highlight, positioned right after LandingHero and
// before the existing Entrance/Villa/Balcony/Exterior hero. Intentionally
// reuses the same LATEST_LAUNCH data as the existing LatestLaunch section
// further down the page — that section is untouched, this is a separate
// component so nothing existing gets moved or modified.
export default function LaunchHighlight() {
  const { openVisitModal } = useScheduleVisit();

  return (
    <section id="launch-highlight" className="bg-background py-24 md:py-32">
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
              Discover
            </Button>
            <Button onClick={openVisitModal} variant="ghost">
              Register Interest
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
