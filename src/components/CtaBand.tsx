"use client";

import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { useScheduleVisit } from "@/components/ScheduleVisitContext";
import { useSiteContent } from "@/lib/query/hooks";

type CtaAction = { label: string; href: string };

/**
 * Reusable closing call-to-action band.
 *
 * Pass `contentKey` to pull the copy from /admin/content → CTA Bands; the
 * props then act as the fallback while content loads, or if an editor removes
 * that band. Either action can open the site-wide visit modal.
 */
export default function CtaBand({
  contentKey,
  eyebrow = "Begin the Conversation",
  title,
  text,
  primary,
  secondary,
  primaryOpensVisitModal = false,
  secondaryOpensVisitModal = false,
}: {
  contentKey?: string;
  eyebrow?: string;
  title: string;
  text?: string;
  primary: CtaAction;
  secondary?: CtaAction;
  primaryOpensVisitModal?: boolean;
  secondaryOpensVisitModal?: boolean;
}) {
  const { openVisitModal } = useScheduleVisit();
  const { data } = useSiteContent();

  const managed = contentKey ? data?.ctaBands?.find((b) => b.key === contentKey) : undefined;
  const heading = managed?.title ?? title;
  const body = managed?.description ?? text;
  const action: CtaAction = managed?.cta ?? primary;

  return (
    <section className="relative overflow-hidden bg-ink py-section-sm text-white">
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
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-display-2 text-white">
            {heading}
          </h2>
        </Reveal>
        {body && (
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-body-lg text-white/70">{body}</p>
          </Reveal>
        )}
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              href={primaryOpensVisitModal ? undefined : action.href}
              onClick={primaryOpensVisitModal ? openVisitModal : undefined}
              variant="gold"
            >
              {action.label}
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
