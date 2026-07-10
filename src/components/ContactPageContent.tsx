"use client";

import { Phone, Mail, Clock } from "lucide-react";
import PageHero from "@/components/PageHero";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import EnquiryForm from "@/components/EnquiryForm";
import MapPlaceholder from "@/components/MapPlaceholder";
import CtaBand from "@/components/CtaBand";
import { useSiteSettings } from "@/lib/query/hooks";
import { CONTACT, OFFICES } from "@/config/company";

// Live from the CMS (Settings section), config as the graceful fallback
// while loading or if the API is unreachable — same pattern as ContactCTA.
export default function ContactPageContent() {
  const { data } = useSiteSettings();
  const contact = data ?? CONTACT;

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title={<>Begin the <span className="italic text-gold-soft">conversation</span></>}
        subtitle="Our residence advisors are available to arrange a private tour at a time that suits you."
        image="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      {/* Form + Info */}
      <section className="bg-background py-24 md:py-32">
        <Container className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Enquire"
              title={<>Request a <span className="italic text-gold">callback</span></>}
              description="Complete the form and a residence advisor will be in touch within one business day."
            />
            <div className="mt-8 flex flex-col gap-4">
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="group flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-gold transition-colors group-hover:bg-gold group-hover:text-white">
                  <Phone size={18} />
                </span>
                <span className="text-[0.95rem] text-ink">{contact.phone}</span>
              </a>
              <a href={`mailto:${contact.email}`} className="group flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-gold transition-colors group-hover:bg-gold group-hover:text-white">
                  <Mail size={18} />
                </span>
                <span className="text-[0.95rem] text-ink">{contact.email}</span>
              </a>
            </div>
          </div>

          <Reveal delay={0.1}>
            <EnquiryForm />
          </Reveal>
        </Container>
      </section>

      {/* Map */}
      <section className="bg-cream pb-24 md:pb-32">
        <Container>
          <MapPlaceholder
            label="RENISINFRA · Jubilee Hills"
            query={contact.address}
            className="h-[420px]"
          />
        </Container>
      </section>

      {/* Offices */}
      <section className="bg-background pb-24 md:pb-32">
        <Container>
          <SectionHeading
            eyebrow="Visit Us"
            title={<>Our <span className="italic text-gold">offices</span></>}
          />
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            {OFFICES.map((o, i) => (
              <Reveal key={o.city} delay={i * 0.08} className="border border-line p-10">
                <h3 className="font-display text-2xl font-light">{o.city}</h3>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{o.address}</p>
                <div className="mt-6 space-y-3 text-[0.9rem] text-ink">
                  <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 transition-colors hover:text-gold">
                    <Phone size={15} className="text-gold" /> {o.phone}
                  </a>
                  <a href={`mailto:${o.email}`} className="flex items-center gap-3 transition-colors hover:text-gold">
                    <Mail size={15} className="text-gold" /> {o.email}
                  </a>
                  <p className="flex items-center gap-3 text-muted">
                    <Clock size={15} className="text-gold" /> {o.hours}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand
        eyebrow="Private Viewing"
        title="Prefer to visit in person?"
        text="Schedule a guided tour of our residences and experience the RENISINFRA standard."
        primary={{ label: "Schedule a Visit", href: "/contact" }}
        secondary={{ label: "Explore Projects", href: "/projects" }}
      />
    </>
  );
}
