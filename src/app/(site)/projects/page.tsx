import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ProjectsExplorer from "@/components/ProjectsExplorer";
import FeaturedProjectSection from "@/components/FeaturedProjectSection";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Projects — RENISINFRA",
  description: "Explore the RENISINFRA portfolio of landmark luxury residences across Hyderabad.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Portfolio"
        title={<>Landmark <span className="italic text-gold-soft">Residences</span></>}
        subtitle="A curated collection of homes defining Hyderabad's most coveted addresses."
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Projects" }]}
      />

      <ProjectsExplorer />

      <FeaturedProjectSection />

      <CtaBand
        title="Can't find the right residence?"
        text="Share your requirements and our advisors will curate a shortlist tailored to you."
        primary={{ label: "Schedule a Visit", href: "/contact" }}
        primaryOpensVisitModal
        secondary={{ label: "View Gallery", href: "/gallery" }}
      />
    </>
  );
}
