"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/PageHero";
import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import Skeleton from "@/components/ui/Skeleton";
import EnquiryForm from "@/components/EnquiryForm";
import MapPlaceholder from "@/components/MapPlaceholder";
import CtaBand from "@/components/CtaBand";
import { useSiteContent, useSiteSettings } from "@/lib/query/hooks";
import { CONTACT } from "@/config/company";

/**
 * Contact details come from Settings; the office list from
 * /admin/content → Offices. Config remains only as a loading fallback for the
 * headline phone/email so the page never renders blank contact info.
 */
export default function ContactPageContent() {
  const { data: settings } = useSiteSettings();
  const { data: content, isPending } = useSiteContent();

  const contact = settings ?? CONTACT;
  const offices = content?.offices ?? [];

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title={
          <>
            Begin the <span className="italic text-gold-soft">conversation</span>
          </>
        }
        subtitle="Our residence advisors are available to arrange a private tour at a time that suits you."
        image="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      {/* Form + headline contact details */}
      <Section tone="light" rhythm="md">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Enquire"
              title={
                <>
                  Request a <span className="italic text-gold">callback</span>
                </>
              }
              description="Complete the form and a residence advisor will be in touch within one business day."
            />
            <div className="mt-8 flex flex-col gap-4">
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="group flex items-center gap-4"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-cream text-gold transition-colors group-hover:bg-gold group-hover:text-white">
                  <Phone size={18} aria-hidden />
                </span>
                <span className="text-body text-ink">{contact.phone}</span>
              </a>
              <a href={`mailto:${contact.email}`} className="group flex items-center gap-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-cream text-gold transition-colors group-hover:bg-gold group-hover:text-white">
                  <Mail size={18} aria-hidden />
                </span>
                <span className="break-all text-body text-ink">{contact.email}</span>
              </a>
              <p className="flex items-center gap-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-cream text-gold">
                  <MapPin size={18} aria-hidden />
                </span>
                <span className="text-body text-muted">{contact.address}</span>
              </p>
            </div>
          </div>

          <Reveal delay={0.1}>
            <EnquiryForm />
          </Reveal>
        </div>
      </Section>

      {/* Map */}
      <Section tone="cream" rhythm="sm">
        <MapPlaceholder
          label={settings?.siteName ?? "RENISINFRA"}
          query={contact.address}
          className="h-[420px]"
        />
      </Section>

      {/* Offices */}
      <Section tone="light" rhythm="md">
        <SectionHeading
          eyebrow="Visit Us"
          title={
            <>
              Our <span className="italic text-gold">offices</span>
            </>
          }
        />

        {isPending ? (
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : offices.length === 0 ? (
          <p className="mt-10 text-center text-body text-muted">
            Office details will be published shortly. In the meantime, please call or email us.
          </p>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            {offices.map((o, i) => (
              <Reveal key={o.city} delay={i * 0.08} className="border border-line p-10">
                <h3 className="font-display text-h2 text-ink">{o.city}</h3>
                <p className="mt-4 text-body text-muted">{o.address}</p>
                <div className="mt-6 space-y-3 text-body-sm text-ink">
                  <a
                    href={`tel:${o.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 transition-colors hover:text-gold"
                  >
                    <Phone size={15} className="flex-none text-gold" aria-hidden /> {o.phone}
                  </a>
                  <a
                    href={`mailto:${o.email}`}
                    className="flex items-center gap-3 break-all transition-colors hover:text-gold"
                  >
                    <Mail size={15} className="flex-none text-gold" aria-hidden /> {o.email}
                  </a>
                  <p className="flex items-center gap-3 text-muted">
                    <Clock size={15} className="flex-none text-gold" aria-hidden /> {o.hours}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      <CtaBand
        contentKey="contact"
        eyebrow="Private Viewing"
        title="Prefer to visit in person?"
        text="Schedule a guided tour of our residences and experience the RENISINFRA standard."
        primary={{ label: "Schedule a Visit", href: "/contact" }}
        primaryOpensVisitModal
        secondary={{ label: "Explore Projects", href: "/projects" }}
      />
    </>
  );
}
