"use client";

import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { ParallaxImage } from "@/components/ui/Parallax";
import { useScheduleVisit } from "@/components/ScheduleVisitContext";
import { imageReveal } from "@/lib/motion";
import { useSiteContent } from "@/lib/query/hooks";

/** Latest-launch band. Copy is CMS-managed via /admin/content → Launch. */
export default function LaunchHighlight() {
  const { openVisitModal } = useScheduleVisit();
  const { data, isPending } = useSiteContent();
  const launch = data?.launch;

  if (isPending) {
    return (
      <Section tone="light" rhythm="md">
        <div className="mx-auto max-w-2xl space-y-5 text-center">
          <Skeleton className="mx-auto h-4 w-32" />
          <Skeleton className="mx-auto h-12 w-2/3" />
          <Skeleton className="mx-auto h-4 w-1/2" />
        </div>
      </Section>
    );
  }

  if (!launch) return null;

  return (
    <Section id="launch-highlight" tone="light" rhythm="md" containerClassName="text-center">
      <Reveal>
        <span className="eyebrow flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gold" />
          {launch.eyebrow}
          <span className="h-px w-8 bg-gold" />
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mx-auto mt-6 max-w-2xl font-display text-display-2 text-ink">
          {launch.name}
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-3 text-[0.85rem] uppercase tracking-[0.2em] text-muted">
          {launch.location}
        </p>
      </Reveal>
      <Reveal delay={0.15}>
        <p className="mx-auto mt-6 max-w-xl text-body-lg text-muted">{launch.description}</p>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href={launch.discoverHref} variant="gold">
            Discover
          </Button>
          <Button onClick={openVisitModal} variant="ghost">
            Register Interest
          </Button>
        </div>
      </Reveal>

      {/* Cinematic strip bridging this band into the pinned reel below. The
          image has always been editable at /admin/content → Launch; nothing
          rendered it until now. */}
      {launch.image && (
        <Reveal delay={0.25} variants={imageReveal} className="mt-16 md:mt-20">
          <ParallaxImage
            src={launch.image}
            alt={launch.name}
            speed={14}
            sizes="(max-width: 768px) 100vw, 90vw"
            className="aspect-[16/9] w-full md:aspect-[21/8]"
          />
        </Reveal>
      )}
    </Section>
  );
}
