import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Container from "@/components/ui/Container";
import AwardsGrid, { AWARDS } from "@/components/AwardsGrid";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Awards",
  description: "Recognition earned by RENIESINFRA's landmark luxury residences.",
};

export default function AwardsPage() {
  return (
    <>
      <PageHero
        variant="brand"
        eyebrow="Recognition"
        title={<>Awards &amp; <span className="italic text-gold-soft">Recognition</span></>}
        subtitle="Honours earned for design, craftsmanship and delivery across the RENIESINFRA portfolio."
        image="https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Media", href: "/gallery" }, { label: "Awards" }]}
      />

      <section className="bg-background py-16 sm:py-20">
        <Container>
          <AwardsGrid items={AWARDS} />
        </Container>
      </section>

      <CtaBand
        contentKey="about"
        eyebrow="Come Home"
        title="Discover a residence worthy of your story."
        primary={{ label: "Explore Projects", href: "/projects" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
    </>
  );
}
