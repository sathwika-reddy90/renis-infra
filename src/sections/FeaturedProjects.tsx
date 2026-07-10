import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

// Compact white intro band — heading only, sized to match the Danube
// reference (not a full section of empty space). The projects themselves
// are presented immediately below in the pinned GSAP scroll showcase
// (see ProjectShowcase.tsx), not as cards in this section.
export default function FeaturedProjects() {
  return (
    <section id="projects" className="bg-background py-16 md:py-20">
      <Container>
        <Reveal className="text-center">
          <span className="eyebrow flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            Our Portfolio
            <span className="h-px w-8 bg-gold" />
          </span>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-light uppercase leading-[1.05] tracking-[0.04em] text-ink md:text-6xl">
            Featured <span className="italic text-gold">Projects</span>
          </h2>
        </Reveal>
      </Container>
    </section>
  );
}
