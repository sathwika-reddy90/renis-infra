"use client";

import Image from "next/image";
import { Eye, Target } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import StatCounter from "@/components/ui/StatCounter";
import Skeleton from "@/components/ui/Skeleton";
import LeadershipGrid from "@/components/LeadershipGrid";
import { useSiteContent } from "@/lib/query/hooks";

const KIND_ICON: Record<string, typeof Eye> = { Vision: Eye, Mission: Target };

const STORY_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1100&q=80";

/**
 * About page body. Every editorial block here is CMS-managed via
 * /admin/content → About / Timeline; it used to live in src/config/about.ts.
 */
export default function AboutContent() {
  const { data, isPending } = useSiteContent();

  if (isPending) {
    return (
      <Section tone="light" rhythm="md">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
          <Skeleton className="aspect-[4/5]" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </Section>
    );
  }

  const about = data?.about;
  const timeline = data?.timeline ?? [];

  return (
    <>
      {/* Story */}
      {about && (
        <Section tone="light" rhythm="md" contained={false}>
          <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={STORY_IMAGE}
                alt="RENIESINFRA craftsmanship"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </Reveal>
            <div>
              <SectionHeading
                align="left"
                eyebrow={about.storyTitle}
                title={
                  <>
                    A house built on <span className="italic text-gold">detail</span>
                  </>
                }
              />
              {about.storyBody.map((paragraph, i) => (
                <Reveal key={paragraph.slice(0, 32)} delay={0.1 + i * 0.04}>
                  <p className="mt-6 max-w-lg text-body text-muted">{paragraph}</p>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Vision & Mission */}
      {(about?.visionMission.length ?? 0) > 0 && (
        <Section tone="cream" rhythm="md">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {about?.visionMission.map((v, i) => {
              const Icon = KIND_ICON[v.kind] ?? Eye;
              return (
                <Reveal
                  key={v.kind}
                  delay={i * 0.08}
                  className="border border-line bg-background p-10 md:p-12"
                >
                  <Icon size={30} strokeWidth={1.2} className="text-gold" aria-hidden />
                  <p className="mt-6 text-[0.72rem] uppercase tracking-[0.24em] text-gold">
                    {v.kind}
                  </p>
                  <h3 className="mt-3 font-display text-display-3 text-ink">{v.title}</h3>
                  <p className="mt-4 text-body text-muted">{v.text}</p>
                </Reveal>
              );
            })}
          </div>
        </Section>
      )}

      {/* Why choose us */}
      {(about?.whyChoose.length ?? 0) > 0 && (
        <Section tone="light" rhythm="md">
          <SectionHeading
            eyebrow="Why Choose Us"
            title={
              <>
                The RENIESINFRA <span className="italic text-gold">difference</span>
              </>
            }
          />
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {about?.whyChoose.map((w, i) => (
              <Reveal key={w.title} delay={(i % 3) * 0.06} className="bg-background p-10">
                <span className="font-display text-display-3 text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-h2 text-ink">{w.title}</h3>
                <p className="mt-3 text-body-sm text-muted">{w.desc}</p>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* Stats */}
      {(about?.stats.length ?? 0) > 0 && (
        <Section tone="ink" rhythm="sm">
          <div className="grid grid-cols-2 gap-y-12 lg:grid-cols-4">
            {about?.stats.map((item) => (
              <Reveal key={item.label} className="text-center">
                <div className="font-display text-display-2 text-white">
                  <StatCounter value={item.stat} />
                </div>
                <p className="mt-3 text-[0.75rem] uppercase tracking-[0.18em] text-white/60">
                  {item.label}
                </p>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* Leadership */}
      <Section tone="cream" rhythm="md">
        <SectionHeading
          eyebrow="Leadership"
          title={
            <>
              The people behind the <span className="italic text-gold">craft</span>
            </>
          }
        />
        <LeadershipGrid />
      </Section>

      {/* Timeline */}
      {timeline.length > 0 && (
        <Section tone="light" rhythm="md" containerClassName="max-w-4xl">
          <SectionHeading
            eyebrow="Our Journey"
            title={
              <>
                A history of <span className="italic text-gold">milestones</span>
              </>
            }
          />
          <ol className="mt-16 border-l border-line">
            {timeline.map((t, i) => (
              <Reveal
                as="li"
                key={t.year}
                delay={i * 0.05}
                className="relative pb-12 pl-10 last:pb-0"
              >
                <span
                  aria-hidden
                  className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-gold bg-background"
                />
                <span className="font-display text-display-3 text-gold">{t.year}</span>
                <h3 className="mt-2 font-display text-h2 text-ink">{t.title}</h3>
                <p className="mt-2 max-w-xl text-body-sm text-muted">{t.text}</p>
              </Reveal>
            ))}
          </ol>
        </Section>
      )}
    </>
  );
}
