"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { HERO_SLIDES } from "@/config/hero";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
      const texts = textRefs.current.filter(Boolean) as HTMLDivElement[];
      if (slides.length < 2) return;

      // Each slide is a full-viewport panel. Panel 0 sits in place; every
      // later panel starts translated one full viewport-height below (out of
      // view) and slides straight up to cover the one beneath it — only one
      // image ever dominates the viewport, no side-by-side reveal.
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
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden">
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={slide.category}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
          className="absolute inset-0"
          style={{ zIndex: i + 1 }}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />

          <span className="absolute left-6 top-28 eyebrow text-white/80 md:left-10">
            {slide.category}
          </span>

          <div
            ref={(el) => {
              textRefs.current[i] = el;
            }}
            className="absolute inset-0 flex items-end"
          >
            <Container className="pb-24 md:pb-28">
              <div className="max-w-2xl">
                <h1 className="font-display text-5xl font-light leading-[1.02] text-white md:text-7xl">
                  {slide.title}
                </h1>
                <p className="mt-4 text-base text-white/80 md:text-lg">{slide.location}</p>
                <div className="mt-9">
                  <Button href={slide.cta.href} variant="gold">
                    {slide.cta.label}
                  </Button>
                </div>
              </div>
            </Container>
          </div>
        </div>
      ))}

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70">
        <span className="text-[0.65rem] uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown size={20} className="animate-bounce" />
      </div>
    </section>
  );
}
