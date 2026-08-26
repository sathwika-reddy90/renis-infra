import { Suspense } from "react";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ProjectsExplorer from "@/components/ProjectsExplorer";
import FeaturedProjectSection from "@/components/FeaturedProjectSection";
import CtaBand from "@/components/CtaBand";
import Container from "@/components/ui/Container";
import Skeleton from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore the RENIESINFRA portfolio of landmark luxury residences across Hyderabad.",
};

function ExplorerFallback() {
  return (
    <section className="bg-background py-section">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
          <div className="hidden space-y-6 lg:block">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5]" />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        variant="brand"
        eyebrow="Our Portfolio"
        title={<>Landmark <span className="italic text-gold-soft">Residences</span></>}
        subtitle="A curated collection of homes defining Hyderabad's most coveted addresses."
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Projects" }]}
      />

      {/* The explorer reads useSearchParams, which needs a Suspense boundary
          for this route to stay statically prerenderable. */}
      <Suspense fallback={<ExplorerFallback />}>
        <ProjectsExplorer />
      </Suspense>

      <FeaturedProjectSection />

      <CtaBand
        contentKey="projects"
        title="Can't find the right residence?"
        text="Share your requirements and our advisors will curate a shortlist tailored to you."
        primary={{ label: "Schedule a Visit", href: "/contact" }}
        primaryOpensVisitModal
        secondary={{ label: "View Gallery", href: "/gallery" }}
      />
    </>
  );
}
