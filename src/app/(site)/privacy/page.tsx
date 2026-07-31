import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import LegalBody from "@/components/LegalBody";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How RENISINFRA collects, uses and safeguards the personal information you share with us.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How we collect, use and safeguard the information you share with us."
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />
      <LegalBody documentName="privacy policy" />
    </>
  );
}
