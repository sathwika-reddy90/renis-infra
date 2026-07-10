"use client";

import Image from "next/image";
import { Check, MapPin } from "lucide-react";
import PageHero from "@/components/PageHero";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import SimpleGallery from "@/components/SimpleGallery";
import FloorPlanTabs from "@/components/FloorPlanTabs";
import Accordion from "@/components/ui/Accordion";
import ContactForm from "@/components/ContactForm";
import MapPlaceholder from "@/components/MapPlaceholder";
import QueryView from "@/components/ui/QueryView";
import ErrorState from "@/components/ui/ErrorState";
import { usePropertyBySlug, useFaqs } from "@/lib/query/hooks";
import type { Property } from "@/types/property";
import type { FAQ } from "@/types/faq";

const SLUG = "the-aureate";
const FAQ_CATEGORY = "The Aureate";

function PageSkeleton() {
  return (
    <>
      <div className="min-h-[62vh] animate-pulse bg-ink" />
      <Container className="py-24">
        <div className="mx-auto h-6 w-40 animate-pulse rounded bg-line" />
        <div className="mx-auto mt-6 h-10 w-2/3 animate-pulse rounded bg-line" />
      </Container>
    </>
  );
}

function Detail({ property, faqs }: { property: Property; faqs: FAQ[] }) {
  return (
    <>
      <PageHero
        eyebrow="Flagship · Jubilee Hills"
        title={property.title}
        subtitle={property.location}
        image={property.featuredImage || "/images/placeholder-project.jpg"}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: "Jubilee Hills" },
        ]}
      />

      {/* Overview */}
      <section className="bg-background py-24 md:py-32">
        <Container className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <span className="eyebrow flex items-center gap-3">
                <span className="h-px w-8 bg-gold" />
                The Overview
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] md:text-5xl">
                An address without equal.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 text-[0.98rem] leading-relaxed text-muted">{property.description}</p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="grid grid-cols-2 gap-x-8 gap-y-8 self-center">
            {property.overviewStats.map((s) => (
              <div key={s.label} className="border-l border-line pl-5">
                <p className="font-display text-2xl font-light md:text-3xl">{s.value}</p>
                <p className="mt-1 text-[0.72rem] uppercase tracking-[0.16em] text-muted">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Gallery */}
      <section className="bg-cream py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="The Residence"
            title={<>A Study in <span className="italic text-gold">Detail</span></>}
          />
          <div className="mt-14">
            <SimpleGallery images={property.gallery} />
          </div>
        </Container>
      </section>

      {/* Amenities */}
      <section className="bg-background py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="Curated Living"
            title={<>Signature <span className="italic text-gold">Amenities</span></>}
          />
          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
            {property.amenities.map((a) => (
              <div key={a} className="flex items-center gap-3 bg-background p-6 text-[0.92rem] transition-colors duration-500 hover:bg-cream">
                <Check size={16} className="flex-none text-gold" />
                {a}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Floor Plans */}
      <section className="bg-cream py-24 md:py-32">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Layouts"
            title={<>Floor <span className="italic text-gold">Plans</span></>}
          />
          <div className="mt-12">
            <FloorPlanTabs plans={property.floorPlans} />
          </div>
        </Container>
      </section>

      {/* Master Plan */}
      <section className="bg-background py-24 md:py-32">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <Reveal className="relative aspect-[16/10] overflow-hidden border border-line">
            <Image src={property.masterPlan || "/images/placeholder-project.jpg"} alt="Master plan" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
          </Reveal>
          <div>
            <Reveal>
              <span className="eyebrow flex items-center gap-3">
                <span className="h-px w-8 bg-gold" />
                Master Plan
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] md:text-5xl">
                Designed around light &amp; landscape.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {property.masterLegend.map((l, i) => (
                  <li key={l} className="flex items-center gap-3 text-[0.92rem] text-ink">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gold/15 text-[0.7rem] font-medium text-gold">
                      {i + 1}
                    </span>
                    {l}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Location & Nearby */}
      <section className="bg-cream py-24 md:py-32">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              align="left"
              eyebrow="The Location"
              title={<>In the heart of <span className="italic text-gold">Jubilee Hills</span></>}
              description={property.location}
            />
            <div className="mt-8">
              <MapPlaceholder label="The Aureate" query="Jubilee Hills, Hyderabad" className="h-[300px]" />
            </div>
          </div>
          <div>
            <h3 className="text-[0.72rem] uppercase tracking-[0.22em] text-gold">Nearby Landmarks</h3>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {property.nearbyLandmarks.map((n) => (
                <li key={n.place} className="flex items-center justify-between gap-4 py-4">
                  <span className="flex items-center gap-3 text-[0.95rem] text-ink">
                    <MapPin size={16} className="text-gold" />
                    {n.place}
                  </span>
                  <span className="text-[0.82rem] uppercase tracking-[0.12em] text-muted">{n.distance}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* FAQs */}
      <section className="bg-background py-24 md:py-32">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="Good to Know"
            title={<>Frequently <span className="italic text-gold">Asked</span></>}
          />
          <div className="mt-12">{faqs.length > 0 && <Accordion items={faqs} />}</div>
        </Container>
      </section>

      {/* Contact */}
      <section id="enquire" className="bg-cream py-24 md:py-32">
        <Container className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Private Preview"
              title={<>Request a <span className="italic text-gold">viewing</span></>}
              description="Share your details and a residence advisor will arrange a private preview of The Aureate."
            />
          </div>
          <ContactForm interests={[...property.floorPlans.map((f) => f.type), "Investment Enquiry"]} />
        </Container>
      </section>
    </>
  );
}

export default function JubileeHillsContent() {
  const propertyQuery = usePropertyBySlug(SLUG);
  const faqsQuery = useFaqs();

  const faqs = (faqsQuery.data ?? []).filter((f) => f.category === FAQ_CATEGORY);

  return (
    <QueryView query={propertyQuery} skeleton={<PageSkeleton />}>
      {(property) =>
        property ? (
          <Detail property={property} faqs={faqs} />
        ) : (
          <div className="pt-40">
            <ErrorState message="This residence could not be found." />
          </div>
        )
      }
    </QueryView>
  );
}
