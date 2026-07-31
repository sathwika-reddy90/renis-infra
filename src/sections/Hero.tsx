"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useCinematicScroll } from "@/lib/useCinematicScroll";
import { useSiteContent } from "@/lib/query/hooks";

/**
 * Pinned, scroll-scrubbed panel stack. This is the homepage's single
 * cinematic moment — ProjectShowcase deliberately does not pin, so the page
 * never hijacks the scroll twice in a row. Panels are CMS-managed via
 * /admin/content → Hero.
 */
export default function Hero() {
  const reduced = useReducedMotion();
  const { data } = useSiteContent();
  const slides = data?.heroSlides ?? [];

  const { section, slides: slideRefs, images, texts } = useCinematicScroll({
    count: slides.length,
    disabled: Boolean(reduced),
  });

  if (slides.length === 0) return null;

  return (
    <section
      ref={section}
      data-hero-dark
      className="relative h-screen w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured addresses"
    >
      {slides.map((slide, i) => (
        <div
          key={`${slide.category}-${i}`}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
          className="absolute inset-0 will-change-transform"
          style={{ zIndex: i + 1 }}
        >
          <div
            ref={(el) => {
              images.current[i] = el;
            }}
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={i === 0}
              sizes="100vw"
              quality={90}
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 scrim-full" />

          <span className="eyebrow absolute left-6 top-28 text-white/80 md:left-10">
            {slide.category}
          </span>

          <div
            ref={(el) => {
              texts.current[i] = el;
            }}
            className="absolute inset-0 flex items-end"
          >
            <Container className="pb-24 md:pb-28">
              <div className="max-w-2xl">
                <h2 className="font-display text-display-1 text-white">{slide.title}</h2>
                <p className="mt-4 text-body-lg text-white/80">{slide.location}</p>
                {slide.cta?.label && (
                  <div className="mt-9">
                    <Button href={slide.cta.href} variant="gold">
                      {slide.cta.label}
                    </Button>
                  </div>
                )}
              </div>
            </Container>
          </div>
        </div>
      ))}

      {!reduced && slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70">
          <span className="text-[0.65rem] uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown size={20} className="animate-bounce" aria-hidden />
        </div>
      )}
    </section>
  );
}
