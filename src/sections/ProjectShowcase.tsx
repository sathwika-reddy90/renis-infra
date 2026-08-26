"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Skeleton from "@/components/ui/Skeleton";
import QueryView from "@/components/ui/QueryView";
import Button from "@/components/ui/Button";
import { ParallaxImage } from "@/components/ui/Parallax";
import { cn } from "@/lib/cn";
import { cardProjects } from "@/lib/homeProjects";
import { easeLux, fadeUp, imageReveal, viewportOnceLoose } from "@/lib/motion";
import { useProjects } from "@/lib/query/hooks";
import type { Project } from "@/types/project";

/**
 * Editorial alternating showcase.
 *
 * Deliberately does NOT pin the scroll: `Hero` owns the page's single pinned
 * sequence. Depth here comes from two scroll-linked layers instead — the
 * photography drifts inside its frame as the row passes, and the whole row
 * recedes into a shallow depth-of-field as it leaves the top of the viewport.
 * Both track scroll position continuously, so they reverse exactly and never
 * take the scroll away from the reader.
 */
function ShowcaseRow({ project, index }: { project: Project; index: number }) {
  const flipped = index % 2 === 1;
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Departure window: from the row's top touching the viewport top, to its
  // bottom clearing it.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  return (
    <div ref={ref}>
      <motion.article
        style={reduced ? undefined : { scale, opacity }}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnceLoose}
        className="grid grid-cols-1 items-center gap-8 will-change-transform lg:grid-cols-12 lg:gap-16"
      >
        <motion.div
          variants={imageReveal}
          className={cn(
            "relative aspect-[4/3] overflow-hidden lg:col-span-7",
            flipped && "lg:order-2",
          )}
        >
          <Link href={project.href} className="group block h-full w-full">
            <ParallaxImage
              src={project.featuredImage || "/images/placeholder-project.jpg"}
              alt={project.title}
              speed={9}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="h-full w-full"
              imageClassName="transition-transform duration-[var(--duration-cinematic)] ease-[var(--ease-lux)] group-hover:scale-[1.04]"
            />
            <span className="absolute left-6 top-6 z-10 bg-white/90 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-ink backdrop-blur">
              {project.status}
            </span>
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className={cn("lg:col-span-5", flipped && "lg:order-1 lg:text-right")}
        >
          <p className="eyebrow">{project.subtitle}</p>
          <h3 className="mt-4 font-display text-display-3 text-ink">{project.title}</h3>
          <p className="mt-3 text-body text-muted">{project.location}</p>

          <dl className={cn("mt-7 flex flex-wrap gap-x-10 gap-y-4", flipped && "lg:justify-end")}>
            {project.bedrooms && (
              <div>
                <dt className="text-[0.66rem] uppercase tracking-[0.2em] text-muted">
                  Configuration
                </dt>
                <dd className="mt-1 font-display text-h3 text-ink">{project.bedrooms}</dd>
              </div>
            )}
            {project.priceLabel && (
              <div>
                <dt className="text-[0.66rem] uppercase tracking-[0.2em] text-muted">Price</dt>
                <dd className="mt-1 font-display text-h3 text-gold">{project.priceLabel}</dd>
              </div>
            )}
          </dl>

          <div className={cn("mt-9 flex", flipped && "lg:justify-end")}>
            <Button href={project.href} variant="ghost" iconAfter={<ArrowUpRight size={15} />}>
              View Residence
            </Button>
          </div>
        </motion.div>
      </motion.article>
    </div>
  );
}

export default function ProjectShowcase() {
  const query = useProjects();

  return (
    <Section id="projects" tone="light" rhythm="lg" contained={false}>
      <Container className="text-center">
        <span className="text-[18px] font-medium uppercase tracking-[0.22em] text-[#888888] [font-family:var(--font-nav),sans-serif]">
          Our Portfolio
        </span>
        <h2 className="mt-3 text-[26px] font-normal uppercase tracking-[0.02em] text-[#bda588] [font-family:var(--font-launch),sans-serif] sm:whitespace-nowrap sm:text-[48px]">
          Signature Residences
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] text-foreground [font-family:var(--font-nav),sans-serif] sm:max-w-none sm:whitespace-nowrap">
          A curated collection of addresses across Hyderabad&apos;s most sought-after corridors.
        </p>
      </Container>

      <Container className="mt-16 md:mt-20">
        <QueryView
          query={query}
          errorMessage="We couldn't load our projects."
          skeleton={
            <div className="space-y-20">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
                  <Skeleton className="aspect-[4/3] lg:col-span-7" />
                  <div className="space-y-4 lg:col-span-5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          {(projects) => {
            // The first HERO_PROJECT_COUNT projects are already on screen in
            // the hero slider, so this rail picks up exactly where it left off
            // and the two never show the same project twice.
            const shown = cardProjects(projects);

            if (shown.length === 0) {
              return (
                <p className="mx-auto max-w-md text-center text-body text-muted">
                  No projects have been published yet. Add a property in the admin dashboard to
                  feature it here.
                </p>
              );
            }

            return (
              <>
                <div className="space-y-24 md:space-y-32">
                  {shown.map((project, i) => (
                    <ShowcaseRow key={project.id} project={project} index={i} />
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewportOnceLoose}
                  transition={{ duration: 0.8, ease: easeLux }}
                  className="mt-20 flex justify-center"
                >
                  <Button href="/projects" variant="ghost">
                    View All Projects
                  </Button>
                </motion.div>
              </>
            );
          }}
        </QueryView>
      </Container>
    </Section>
  );
}
