"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { SHOWCASE_PROJECTS } from "@/config/showcaseProjects";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Pinned, scroll-scrubbed showcase — the exact same mechanic as the
// Entrance/Villa/Balcony/Exterior hero: each slide is a full-viewport panel
// stacked in place, starting translated one viewport-height below, sliding
// straight up to cover the slide beneath it as the user scrolls. Both
// images stay visible mid-transition; scrolling up reverses it perfectly.
export default function ProjectShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
      const texts = textRefs.current.filter(Boolean) as HTMLDivElement[];
      if (slides.length < 2) return;

      gsap.set(slides[0], { yPercent: 0 });
      gsap.set(slides.slice(1), { yPercent: 100 });
      gsap.set(texts[0], { autoAlpha: 1, y: 0 });
      gsap.set(texts.slice(1), { autoAlpha: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${(slides.length - 1) * window.innerHeight * 1.3}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      for (let i = 1; i < slides.length; i++) {
        tl.to(
          slides[i],
          { yPercent: 0, ease: "power3.out", duration: 1 },
          i - 1,
        )
          .to(
            texts[i - 1],
            { autoAlpha: 0, y: -24, ease: "power2.out", duration: 0.4 },
            i - 1,
          )
          .to(
            texts[i],
            { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.5 },
            i - 1 + 0.5,
          );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="showcase" ref={sectionRef} className="relative h-screen w-full overflow-hidden">
      {SHOWCASE_PROJECTS.map((project, i) => (
        <div
          key={project.id}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
          className="absolute inset-0"
          style={{ zIndex: i + 1 }}
        >
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />

          <span className="absolute right-6 top-28 font-display text-sm tracking-[0.2em] text-white/50 md:right-10">
            {String(i + 1).padStart(2, "0")} / {String(SHOWCASE_PROJECTS.length).padStart(2, "0")}
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
                  {project.description}
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
