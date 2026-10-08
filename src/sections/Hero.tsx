"use client";

import type { CSSProperties } from "react";
import Image, { getImageProps } from "next/image";
import { useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useCinematicScroll } from "@/lib/useCinematicScroll";
import { HERO_MOBILE_IMAGES, heroProjects, type MobileArt } from "@/lib/homeProjects";
import { useProjects } from "@/lib/query/hooks";

/** Upright phones get the portrait artwork. Must match `.has-mobile-art` in globals.css. */
const MOBILE_ART_MEDIA = "(max-width: 767px) and (max-aspect-ratio: 3/4)";

/**
 * A panel's photograph. With portrait artwork available, a <picture> lets the
 * browser fetch exactly one file — the portrait render on an upright phone,
 * the existing desktop image everywhere else (same src, sizes and quality as
 * before, so desktop is untouched).
 */
function SlideImage({
  src,
  mobile,
  alt,
  first,
}: {
  src: string;
  mobile?: MobileArt;
  alt: string;
  first: boolean;
}) {
  const common = { fill: true, sizes: "100vw", quality: 90, className: "object-cover" };
  if (!mobile) return <Image src={src} alt={alt} priority={first} {...common} />;

  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...common, src: mobile.src, alt });
  // `priority` would preload the desktop file on phones too; eager + high
  // fetch priority fetches whichever source the browser actually picks.
  const { props } = getImageProps({
    ...common,
    src,
    alt,
    ...(first ? ({ loading: "eager", fetchPriority: "high" } as const) : {}),
  });

  return (
    <picture>
      <source media={MOBILE_ART_MEDIA} srcSet={mobileSrcSet} sizes="100vw" />
      {/* --art-focus is only read by the phone rule for `.has-mobile-art`. */}
      <img
        {...props}
        alt={alt}
        style={{ ...props.style, ...(mobile.focus ? { "--art-focus": mobile.focus } : {}) } as CSSProperties}
      />
    </picture>
  );
}

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
            className={cn(
              "showcase-media absolute inset-0 will-change-transform",
              HERO_MOBILE_IMAGES[slide.slug] && "has-mobile-art",
            )}
          >
            <SlideImage
              src={slide.featuredImage || "/images/placeholder-project.jpg"}
              mobile={HERO_MOBILE_IMAGES[slide.slug]}
              alt={slide.title}
              first={i === 0}
            />
          </div>
          <div className="absolute inset-0 scrim-hero" />

          <div
            ref={(el) => {
              texts.current[i] = el;
            }}
            className="absolute inset-0 flex items-end"
          >
            <Container className="pb-24 md:pb-28">
              <div className="max-w-2xl">
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
