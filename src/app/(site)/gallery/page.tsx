import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import GalleryClient from "@/components/GalleryClient";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Gallery — RENISINFRA",
  description: "Spaces, finishes and moments from across the RENISINFRA collection.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="The Portfolio"
        title={<>A Study in <span className="italic text-gold-soft">Detail</span></>}
        subtitle="Interiors, architecture and amenities from across the RENISINFRA collection."
        image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />

      <GalleryClient />

      <CtaBand
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
