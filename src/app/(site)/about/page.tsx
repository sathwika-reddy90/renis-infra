import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import AboutContent from "@/components/AboutContent";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "About",
  description: "The story, vision and people behind RENIESINFRA's landmark luxury residences.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        variant="brand"
        eyebrow="Our Story"
        title={
          <>
            Building for the <span className="italic text-gold-soft">generations</span>
          </>
        }
        subtitle="Nearly two decades of crafting homes defined by design, honesty and enduring value."
        image="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <AboutContent />

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
