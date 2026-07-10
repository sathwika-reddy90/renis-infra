"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useProjects } from "@/lib/query/hooks";
import type { Project } from "@/types/project";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function ShowcaseSkeleton() {
  return <Skeleton className="h-screen w-full" />;
}

function EmptyShowcase() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center bg-cream px-6 text-center">
      <p className="max-w-md text-[0.95rem] leading-relaxed text-muted">
        No projects have been published yet. Add a property in the admin
        dashboard to feature it here.
      </p>
    </div>
  );
}

// Pinned, scroll-scrubbed showcase — the exact same mechanic as the
// Entrance/Villa/Balcony/Exterior hero: each slide is a full-viewport panel
// stacked in place, starting translated one viewport-height below, sliding
// straight up to cover the slide beneath it as the user scrolls. Both
// images stay visible mid-transition; scrolling up reverses it perfectly.
// Data is live from the CMS (`useProjects` → GET /properties) — up to the
// first 4 published properties, in whatever order the API returns.
function ShowcaseSlides({ projects }: { projects: Project[] }) {
  const slides = projects.slice(0, 4);
  const sectionRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const slideEls = slideRefs.current.filter(Boolean) as HTMLDivElement[];
      const textEls = textRefs.current.filter(Boolean) as HTMLDivElement[];
      if (slideEls.length < 2) return;

      gsap.set(slideEls[0], { yPercent: 0 });
      gsap.set(slideEls.slice(1), { yPercent: 100 });
      gsap.set(textEls[0], { autoAlpha: 1, y: 0 });
      gsap.set(textEls.slice(1), { autoAlpha: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${(slideEls.length - 1) * window.innerHeight * 1.3}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      for (let i = 1; i < slideEls.length; i++) {
        tl.to(
          slideEls[i],
          { yPercent: 0, ease: "power3.out", duration: 1 },
          i - 1,
        )
          .to(
            textEls[i - 1],
            { autoAlpha: 0, y: -24, ease: "power2.out", duration: 0.4 },
            i - 1,
          )
          .to(
            textEls[i],
            { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.5 },
            i - 1 + 0.5,
          );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [slides]);

  if (slides.length === 0) return <EmptyShowcase />;

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden">
      {slides.map((project, i) => (
        <div
          key={project.id}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
          className="absolute inset-0"
          style={{ zIndex: i + 1 }}
        >
          <Image
            src={project.featuredImage || "/images/placeholder-project.jpg"}
            alt={project.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />

          <span className="absolute right-6 top-28 font-display text-sm tracking-[0.2em] text-white/50 md:right-10">
            {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>

          <div
            ref={(el) => {
              textRefs.current[i] = el;
            }}
            className="absolute inset-0 flex items-end"
          >
            <Container className="pb-24 md:pb-28">
              <div className="max-w-2xl">
                <h3 className="font-display text-4xl font-light uppercase leading-[1.05] tracking-[0.02em] text-white md:text-6xl lg:text-7xl">
                  {project.title}
                </h3>
                <p className="mt-4 text-[0.95rem] text-white/80">{project.location}</p>
                <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-white/70">
                  {project.subtitle}
                </p>
                <div className="mt-9">
                  <Button href={project.href} variant="gold">
                    View Project
                  </Button>
                </div>
              </div>
            </Container>
          </div>
        </div>
      ))}
    </section>
  );
}

export default function ProjectShowcase() {
  const query = useProjects();

  return (
    <div id="showcase">
      <QueryView query={query} skeleton={<ShowcaseSkeleton />} errorMessage="Unable to load projects right now.">
        {(projects) => <ShowcaseSlides projects={projects} />}
      </QueryView>
    </div>
  );
}
