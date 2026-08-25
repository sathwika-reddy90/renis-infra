import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import LegalBody from "@/components/LegalBody";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms governing your use of the RENIESINFRA website.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Use"
        subtitle="The terms that govern your use of this website and its content."
        image="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Terms of Use" }]}
      />
      <LegalBody documentName="terms of use" />
    </>
  );
}
