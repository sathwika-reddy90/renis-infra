import type { Metadata } from "next";
import Image from "next/image";
import { Eye, Target } from "lucide-react";
import PageHero from "@/components/PageHero";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import StatCounter from "@/components/ui/StatCounter";
import CtaBand from "@/components/CtaBand";
import LeadershipGrid from "@/components/LeadershipGrid";
import { STATS as WHY } from "@/config/company";
import { VISION_MISSION, WHY_CHOOSE, TIMELINE } from "@/config/about";

export const metadata: Metadata = {
  title: "About — RENISINFRA",
  description: "The story, vision and people behind RENISINFRA's landmark luxury residences.",
};

const KIND_ICON = { Vision: Eye, Mission: Target } as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title={<>Building for the <span className="italic text-gold-soft">generations</span></>}
        subtitle="Nearly two decades of crafting homes defined by design, honesty and enduring value."
        image="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      {/* Company Story */}
      <section className="bg-background py-24 md:py-32">
        <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1100&q=80"
              alt="RENISINFRA craftsmanship"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow="Who We Are"
              title={<>A house built on <span className="italic text-gold">detail</span></>}
            />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-lg text-[0.98rem] leading-relaxed text-muted">
                RENISINFRA was founded on a simple belief — that a home should appreciate not only
                in value, but in the quality of life it offers. Since 2007 we have partnered with
                acclaimed architects and craftspeople to build residences that remain relevant for
                decades.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-4 max-w-lg text-[0.98rem] leading-relaxed text-muted">
                Every project begins with the address and ends with the smallest of details —
                because both, we believe, define how a home is lived in.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Vision & Mission */}
      <section className="bg-cream py-24 md:py-32">
        <Container className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {VISION_MISSION.map((v, i) => {
            const Icon = KIND_ICON[v.kind as keyof typeof KIND_ICON];
            return (
              <Reveal key={v.kind} delay={i * 0.08} className="border border-line bg-background p-10 md:p-12">
                <Icon size={30} strokeWidth={1.2} className="text-gold" />
                <p className="mt-6 text-[0.72rem] uppercase tracking-[0.24em] text-gold">{v.kind}</p>
                <h3 className="mt-3 font-display text-3xl font-light">{v.title}</h3>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{v.text}</p>
              </Reveal>
            );
          })}
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="bg-background py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="Why Choose Us"
            title={<>The RENISINFRA <span className="italic text-gold">difference</span></>}
          />
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE.map((w, i) => (
              <Reveal key={w.title} delay={(i % 3) * 0.06} className="bg-background p-10">
                <span className="font-display text-3xl font-light text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-2xl font-light">{w.title}</h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">{w.desc}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Statistics */}
      <section className="bg-ink py-20 text-white md:py-24">
        <Container>
          <div className="grid grid-cols-2 gap-y-12 lg:grid-cols-4">
            {WHY.map((item) => (
              <Reveal key={item.label} className="text-center">
                <div className="font-display text-5xl font-light md:text-6xl">
                  <StatCounter value={item.stat} />
                </div>
                <p className="mt-3 text-[0.75rem] uppercase tracking-[0.18em] text-white/60">
                  {item.label}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Leadership */}
      <section className="bg-cream py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="Leadership"
            title={<>The people behind the <span className="italic text-gold">craft</span></>}
          />
          <LeadershipGrid />
        </Container>
      </section>

      {/* Timeline */}
      <section className="bg-background py-24 md:py-32">
        <Container className="max-w-4xl">
          <SectionHeading
            eyebrow="Our Journey"
            title={<>A history of <span className="italic text-gold">milestones</span></>}
          />
          <div className="mt-16 border-l border-line">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.05} className="relative pb-12 pl-10 last:pb-0">
                <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-gold bg-background" />
                <span className="font-display text-3xl font-light text-gold">{t.year}</span>
                <h3 className="mt-2 font-display text-2xl font-light">{t.title}</h3>
                <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-muted">{t.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand
        eyebrow="Come Home"
        title="Discover a residence worthy of your story."
        primary={{ label: "Explore Projects", href: "/projects" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
    </>
  );
}
