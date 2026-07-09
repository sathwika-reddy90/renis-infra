"use client";

import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { useScheduleVisit } from "@/components/ScheduleVisitContext";

type CtaAction = { label: string; href: string };

// Reusable closing call-to-action band used across inner pages. Either action
// can open the site-wide "Schedule a Visit" modal instead of navigating.
export default function CtaBand({
  eyebrow = "Begin the Conversation",
  title,
  text,
  primary,
  secondary,
  primaryOpensVisitModal = false,
  secondaryOpensVisitModal = false,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  primary: CtaAction;
  secondary?: CtaAction;
  primaryOpensVisitModal?: boolean;
  secondaryOpensVisitModal?: boolean;
}) {
  const { openVisitModal } = useScheduleVisit();

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white md:py-28">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

      <Container className="relative z-10 text-center">
        <Reveal>
          <span className="eyebrow flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            {eyebrow}
            <span className="h-px w-8 bg-gold" />
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-light leading-[1.06] md:text-5xl">
            {title}
          </h2>
        </Reveal>
        {text && (
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-[1rem] leading-relaxed text-white/70">{text}</p>
          </Reveal>
        )}
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              href={primaryOpensVisitModal ? undefined : primary.href}
              onClick={primaryOpensVisitModal ? openVisitModal : undefined}
              variant="gold"
            >
              {primary.label}
            </Button>
            {secondary && (
              <Button
                href={secondaryOpensVisitModal ? undefined : secondary.href}
                onClick={secondaryOpensVisitModal ? openVisitModal : undefined}
                variant="outline"
              >
                {secondary.label}
              </Button>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
