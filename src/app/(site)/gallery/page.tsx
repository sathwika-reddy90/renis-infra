import { Suspense } from "react";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import GalleryClient from "@/components/GalleryClient";
import CtaBand from "@/components/CtaBand";
import Container from "@/components/ui/Container";
import Skeleton from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Spaces, finishes and moments from across the RENIESINFRA collection.",
};

function GalleryFallback() {
  const heights = ["h-64", "h-48", "h-56", "h-72", "h-52", "h-60"];
  return (
    <section className="bg-background py-section-sm">
      <Container>
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {heights.map((h, i) => (
            <Skeleton key={i} className={`w-full break-inside-avoid ${h}`} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default function GalleryPage() {
  return (
    <>
      <PageHero
        variant="brand"
        eyebrow="The Portfolio"
        title={<>A Study in <span className="italic text-gold-soft">Detail</span></>}
        subtitle="Interiors, architecture and amenities from across the RENIESINFRA collection."
        image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />

      {/* Reads useSearchParams for the category deep-link, so it needs a
          Suspense boundary to stay statically prerenderable. */}
      <Suspense fallback={<GalleryFallback />}>
        <GalleryClient />
      </Suspense>

      <CtaBand
        contentKey="gallery"
        eyebrow="See it in Person"
        title="Photographs only tell half the story."
        text="Book a private walkthrough and experience the craftsmanship first-hand."
        primary={{ label: "Schedule a Visit", href: "/contact" }}
        primaryOpensVisitModal
        secondary={{ label: "View Projects", href: "/projects" }}
      />
    </>
  );
}
