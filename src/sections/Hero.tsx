"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useCinematicScroll } from "@/lib/useCinematicScroll";
import { heroProjects } from "@/lib/homeProjects";
import { useProjects } from "@/lib/query/hooks";

/**
 * Pinned, scroll-scrubbed panel stack. This is the homepage's single
 * cinematic moment — ProjectShowcase deliberately does not pin, so the page
 * never hijacks the scroll twice in a row.
 *
 * Panels are the first `HERO_PROJECT_COUNT` projects. Everything after that
 * falls through to ProjectShowcase, so the two never repeat a project.
 */
export default function Hero() {
  const reduced = useReducedMotion();
  const { data } = useProjects();
  const slides = heroProjects(data ?? []);

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
          key={slide.id}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
          // `overflow-hidden` makes the panel a window onto its own image:
          // as the panel slides up, the image inside counter-translates by
          // the same amount and so stays put on screen, with the panel's
          // moving lower edge deciding how much of it you still see.
          className="absolute inset-0 overflow-hidden will-change-transform"
          // Stacked pages: the FIRST panel sits on top, each later panel
          // directly beneath it, already in its final position.
          style={{ zIndex: slides.length - i }}
        >
          <div
            ref={(el) => {
              images.current[i] = el;
            }}
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src={slide.featuredImage || "/images/placeholder-project.jpg"}
              alt={slide.title}
              fill
              priority={i === 0}
              sizes="100vw"
              quality={90}
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 scrim-hero" />

          <span className="eyebrow absolute left-6 top-28 text-white/80 md:left-10">
            {slide.status}
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

                {/* Configuration + price — the two facts a buyer scans for
                    first, in the same pairing ProjectCard uses. */}
                {(slide.bedrooms || slide.priceLabel) && (
                  <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                    {slide.bedrooms && (
                      <div>
                        <dt className="text-[0.66rem] uppercase tracking-[0.2em] text-white/60">
                          Configuration
                        </dt>
                        <dd className="mt-1 font-display text-h3 text-white">{slide.bedrooms}</dd>
                      </div>
                    )}
                    {slide.priceLabel && (
                      <div>
                        <dt className="text-[0.66rem] uppercase tracking-[0.2em] text-white/60">
                          Price
                        </dt>
                        <dd className="mt-1 font-display text-h3 text-gold-soft">
                          {slide.priceLabel}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}

                <div className="mt-9">
                  <Button href={slide.href} variant="gold">
                    View Residence
                  </Button>
                </div>
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
