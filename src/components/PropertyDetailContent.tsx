"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  MessageCircle,
  Phone,
  Play,
  ShieldCheck,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Dialog from "@/components/ui/Dialog";
import Lightbox from "@/components/ui/Lightbox";
import Accordion from "@/components/ui/Accordion";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import StickyNav, { type StickyNavItem } from "@/components/ui/StickyNav";
import FloorPlanTabs from "@/components/FloorPlanTabs";
import MapPlaceholder from "@/components/MapPlaceholder";
import ContactForm from "@/components/ContactForm";
import ProjectCard from "@/components/ProjectCard";
import { cn } from "@/lib/cn";
import { resolveIcon } from "@/lib/icons";
import { easeLux, fadeUp, staggerFast, viewportOnce } from "@/lib/motion";
import { useScheduleVisit } from "@/components/ScheduleVisitContext";
import {
  useFaqs,
  usePropertyBySlug,
  useRelatedProjects,
  useSiteSettings,
} from "@/lib/query/hooks";
import type { Property } from "@/types/property";

/* ---------------------------------- hero ----------------------------------- */

function ProjectHero({
  property,
  onEnquire,
  onPlayVideo,
}: {
  property: Property;
  onEnquire: () => void;
  onPlayVideo: () => void;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  // The hero mirrors the homepage card: same featuredImage, so clicking
  // "View Residence" lands on the identical photograph. heroImages remains
  // only as a fallback for a property with no featured image set.
  const images = property.featuredImage ? [property.featuredImage] : property.heroImages;
  const go = (dir: number) => setIndex((i) => (i + dir + images.length) % images.length);

  return (
    <section data-hero-dark className="relative min-h-[86vh] overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: reduced ? 1 : 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.2 : 1.4, ease: easeLux }}
          className="absolute inset-0"
        >
          <Image
            src={images[index]}
            alt={property.title}
            fill
            priority
            sizes="100vw"
            quality={90}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 scrim-full" />

      <Container className="relative flex min-h-[86vh] flex-col justify-end pb-16 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeLux, delay: 0.2 }}
          className="max-w-3xl"
        >
          {/* The hero shows only the photograph and the action buttons — all
              project information (name, location, price, configuration,
              possession, status) lives in the sections below. The title stays
              in the DOM as the page's h1 for SEO/screen readers, visually
              hidden. */}
          <h1 className="sr-only">{property.title}</h1>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="gold" onClick={onEnquire}>
              Register Interest
            </Button>
            {property.brochure && (
              <Button href={property.brochure} variant="outline" icon={<Download size={15} />}>
                Brochure
              </Button>
            )}
            {property.video && (
              <Button variant="outline" onClick={onPlayVideo} icon={<Play size={15} />}>
                Walkthrough
              </Button>
            )}
          </div>
        </motion.div>
      </Container>

      {images.length > 1 && (
        <div className="absolute bottom-8 right-6 z-10 flex items-center gap-2 md:right-10">
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => go(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-gold hover:text-gold"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <span className="px-2 text-[0.72rem] tracking-[0.2em] text-white/70">
            {index + 1} / {images.length}
          </span>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => go(1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-gold hover:text-gold"
          >
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}

function StatGrid({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <motion.dl
      variants={staggerFast}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="grid grid-cols-2 border-l border-t border-line md:grid-cols-3"
    >
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={fadeUp} className="border-b border-r border-line p-6">
          <dt className="text-[0.66rem] uppercase tracking-[0.2em] text-muted">{stat.label}</dt>
          <dd className="mt-2 font-display text-h3 text-ink">{stat.value}</dd>
        </motion.div>
      ))}
    </motion.dl>
  );
}

/* ---------------------------------- page ----------------------------------- */

export default function PropertyDetailContent({ slug }: { slug: string }) {
  const query = usePropertyBySlug(slug);
  const faqsQuery = useFaqs();
  const related = useRelatedProjects(slug);
  const { data: settings } = useSiteSettings();
  const { openVisitModal } = useScheduleVisit();

  const [lightbox, setLightbox] = useState<number | null>(null);
  const [planImage, setPlanImage] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  const property = query.data ?? null;

  // Only sections with content get an anchor, so the sticky nav never points
  // at something that isn't rendered.
  const navItems = useMemo<StickyNavItem[]>(() => {
    if (!property) return [];
    const items: StickyNavItem[] = [{ id: "overview", label: "Overview" }];
    if (property.highlights.length > 0) items.push({ id: "highlights", label: "Highlights" });
    if (property.floorPlans.length > 0) items.push({ id: "plans", label: "Plans" });
    if (property.amenities.length > 0) items.push({ id: "amenities", label: "Amenities" });
    if (property.gallery.length > 0) items.push({ id: "gallery", label: "Gallery" });
    if (property.specifications.length > 0) items.push({ id: "specs", label: "Specifications" });
    if (property.paymentPlans.length > 0) items.push({ id: "payment", label: "Payment" });
    items.push({ id: "location", label: "Location" }, { id: "enquire", label: "Enquire" });
    return items;
  }, [property]);

  if (query.isPending) {
    return (
      <div>
        <Skeleton className="h-[86vh] w-full rounded-none" />
        <Container className="space-y-4 py-24">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </Container>
      </div>
    );
  }

  if (query.isError) {
    return (
      <Section tone="light" rhythm="lg">
        <ErrorState
          message="We couldn't load this residence."
          onRetry={() => void query.refetch()}
        />
      </Section>
    );
  }

  if (!property) {
    return (
      <Section tone="light" rhythm="lg" containerClassName="text-center">
        <h1 className="font-display text-display-2 text-ink">Residence not found.</h1>
        <p className="mx-auto mt-4 max-w-md text-body text-muted">
          This address may have been renamed or is no longer listed.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/projects" variant="gold">
            View All Projects
          </Button>
        </div>
      </Section>
    );
  }

  const faqs = (faqsQuery.data ?? []).filter(
    (f) => f.category === property.title || f.category === property.slug,
  );

  const phone = settings?.phone ?? "";
  const telHref = `tel:${phone.replace(/\s/g, "")}`;
  const waHref = `https://wa.me/${phone.replace(/\D/g, "")}`;

  return (
    <>
      <ProjectHero
        property={property}
        onEnquire={openVisitModal}
        onPlayVideo={() => setVideoOpen(true)}
      />

      <StickyNav items={navItems} />

      {/* Overview */}
      {/* Overview → Highlights → Plans sit tighter than the page's default
          rhythm: the stats grid, highlight cards and floor plans read as one
          continuous run of project facts. */}
      <Section id="overview" tone="light" rhythm="none" className="pt-section-sm pb-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="eyebrow">The Address</span>
            <h2 className="mt-4 font-display text-display-3 text-ink">
              Designed around light &amp; landscape.
            </h2>
            {property.developer && (
              <p className="mt-6 flex items-center gap-2 text-body-sm text-muted">
                <BadgeCheck size={15} className="flex-none text-gold" aria-hidden />
                Developed by {property.developer}
              </p>
            )}
          </div>
          <div className="lg:col-span-7">
            <p className="text-body-lg text-muted">{property.description}</p>
            {property.reraNumber && (
              <p className="mt-6 inline-flex items-center gap-2 border border-line bg-cream px-4 py-2.5 text-[0.75rem] tracking-[0.12em] text-muted">
                <ShieldCheck size={14} className="flex-none text-gold" aria-hidden />
                RERA · {property.reraNumber}
              </p>
            )}
          </div>
        </div>

        {property.overviewStats.length > 0 && (
          <div className="mt-14">
            <StatGrid stats={property.overviewStats} />
          </div>
        )}
      </Section>

      {/* Highlights */}
      {property.highlights.length > 0 && (
        <Section id="highlights" tone="cream" rhythm="none" className="pt-10 pb-10">
          <SectionHeading eyebrow="What Sets It Apart" title="Highlights" align="center" />
          <motion.div
            variants={staggerFast}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {property.highlights.map((h) => {
              const Icon = resolveIcon(h.icon);
              return (
                <motion.div key={h.title} variants={fadeUp}>
                  <Card tone="light" hover className="h-full p-8">
                    <Icon size={26} strokeWidth={1.25} className="text-gold" aria-hidden />
                    <h3 className="mt-5 font-display text-h3 text-ink">{h.title}</h3>
                    <p className="mt-3 text-body-sm text-muted">{h.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </Section>
      )}

      {/* Floor plans */}
      {property.floorPlans.length > 0 && (
        <Section id="plans" tone="light" rhythm="none" className="pt-10 pb-section-sm">
          <SectionHeading
            eyebrow="Configurations"
            title="Floor Plans"
            align="left"
            className="mb-12"
          />
          <FloorPlanTabs plans={property.floorPlans} onExpand={setPlanImage} />
        </Section>
      )}

      {/* Amenities */}
      {property.amenities.length > 0 && (
        <Section id="amenities" tone="ink" rhythm="sm">
          <SectionHeading eyebrow="The Lifestyle" title="Amenities" align="center" invert />
          <motion.ul
            variants={staggerFast}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-14 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {property.amenities.map((a) => (
              <motion.li
                key={a}
                variants={fadeUp}
                className="flex items-center gap-3 border-b border-white/10 py-3.5 text-body-sm text-white/85"
              >
                <Check size={14} className="flex-none text-gold" aria-hidden />
                {a}
              </motion.li>
            ))}
          </motion.ul>
        </Section>
      )}

      {/* Gallery */}
      {property.gallery.length > 0 && (
        <Section id="gallery" tone="light" rhythm="sm">
          <SectionHeading eyebrow="Imagery" title="Gallery" align="center" />
          <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
            {property.gallery.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setLightbox(i)}
                aria-label={`Open image ${i + 1} of ${property.gallery.length}`}
                className={cn(
                  "group relative overflow-hidden bg-cream",
                  // Break the grid rhythm so it reads editorial, not contact-sheet.
                  i % 5 === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/5]",
                )}
              >
                <Image
                  src={src}
                  alt={`${property.title} — image ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[var(--duration-cinematic)] ease-[var(--ease-lux)] group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Master plan */}
      {property.masterLegend.length > 0 && (
        <Section tone="cream" rhythm="sm">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <button
                type="button"
                onClick={() => setPlanImage(property.masterPlan)}
                aria-label="Enlarge master plan"
                className="relative block aspect-[4/3] w-full overflow-hidden"
              >
                <Image
                  src={property.masterPlan}
                  alt={`${property.title} master plan`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              </button>
            </div>
            <div className="lg:col-span-5">
              <span className="eyebrow">Site Layout</span>
              <h2 className="mt-4 font-display text-display-3 text-ink">Master Plan</h2>
              <ol className="mt-8 space-y-3">
                {property.masterLegend.map((item, i) => (
                  <li key={item} className="flex items-baseline gap-4 text-body-sm text-muted">
                    <span className="font-display text-h4 text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Section>
      )}

      {/* Specifications — in the model all along, never rendered before. */}
      {property.specifications.length > 0 && (
        <Section id="specs" tone="light" rhythm="sm">
          <SectionHeading eyebrow="Build Quality" title="Specifications" align="left" />
          <div className="mt-12 grid grid-cols-1 gap-x-16 gap-y-10 md:grid-cols-2">
            {property.specifications.map((spec) => (
              <div key={spec.category}>
                <h3 className="border-b border-line pb-3 text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                  {spec.category}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {spec.items.map((item) => (
                    <li key={item} className="flex gap-3 text-body-sm text-muted">
                      <span aria-hidden className="mt-2.5 h-px w-3 flex-none bg-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Payment plans — likewise. */}
      {property.paymentPlans.length > 0 && (
        <Section id="payment" tone="cream" rhythm="sm">
          <SectionHeading eyebrow="Ownership" title="Payment Plans" align="center" />
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {property.paymentPlans.map((plan) => (
              <Card key={plan.id} tone="light" hover className="p-8">
                {plan.milestone && (
                  <p className="font-display text-display-3 text-gold">{plan.milestone}</p>
                )}
                <h3 className="mt-4 font-display text-h3 text-ink">{plan.label}</h3>
                <p className="mt-3 text-body-sm text-muted">{plan.description}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Location */}
      <Section id="location" tone="light" rhythm="sm">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <MapPlaceholder
              label={property.title}
              query={`${property.title}, ${property.location}, ${property.city}`}
              className="h-full"
            />
          </div>
          <div className="lg:col-span-5">
            <span className="eyebrow">Connectivity</span>
            <h2 className="mt-4 font-display text-display-3 text-ink">The Neighbourhood</h2>
            <p className="mt-4 text-body text-muted">{property.location}</p>

            {property.nearbyLandmarks.length > 0 && (
              <ul className="mt-8 divide-y divide-line border-y border-line">
                {property.nearbyLandmarks.map((l) => (
                  <li key={l.place} className="flex items-center justify-between gap-6 py-3.5">
                    <span className="text-body-sm text-ink">
                      {l.place}
                      {l.category && (
                        <span className="ml-2 text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                          {l.category}
                        </span>
                      )}
                    </span>
                    <span className="whitespace-nowrap text-body-sm text-gold">{l.distance}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <Section tone="cream" rhythm="sm">
          <SectionHeading eyebrow="Questions" title="Frequently Asked" align="center" />
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion items={faqs} />
          </div>
        </Section>
      )}

      {/* Enquiry */}
      <Section id="enquire" tone="light" rhythm="sm">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="eyebrow">Private Viewing</span>
            <h2 className="mt-4 font-display text-display-3 text-ink">Register your interest.</h2>
            <p className="mt-4 text-body text-muted">
              Share your details and a residence advisor will be in touch to arrange a private
              viewing of {property.title}.
            </p>
            {property.brochure && (
              <Button
                href={property.brochure}
                variant="ghost"
                icon={<Download size={15} />}
                className="mt-8"
              >
                Download Brochure
              </Button>
            )}
          </div>
          <div className="lg:col-span-7">
            <ContactForm interests={[property.title]} defaultInterest={property.title} />
          </div>
        </div>
      </Section>

      {/* Related */}
      {(related.data?.length ?? 0) > 0 && (
        <Section tone="cream" rhythm="sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Explore More" title="Other Residences" align="left" />
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.2em] text-gold hover:underline"
            >
              View all <ArrowUpRight size={14} aria-hidden />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.data?.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )}

      {/* Sticky mobile action bar */}
      <div
        className="fixed inset-x-0 bottom-0 grid grid-cols-3 border-t border-line bg-white/95 backdrop-blur-md md:hidden"
        style={{ zIndex: "var(--z-sticky)" }}
      >
        {phone && (
          <>
            <a
              href={telHref}
              className="flex flex-col items-center gap-1 py-3 text-[0.62rem] uppercase tracking-[0.16em] text-ink"
            >
              <Phone size={16} className="text-gold" aria-hidden />
              Call
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 border-x border-line py-3 text-[0.62rem] uppercase tracking-[0.16em] text-ink"
            >
              <MessageCircle size={16} className="text-gold" aria-hidden />
              WhatsApp
            </a>
          </>
        )}
        <button
          type="button"
          onClick={openVisitModal}
          className={cn(
            "flex flex-col items-center gap-1 bg-gold py-3 text-[0.62rem] uppercase tracking-[0.16em] text-white",
            !phone && "col-span-3",
          )}
        >
          <ArrowUpRight size={16} aria-hidden />
          Enquire
        </button>
      </div>
      {/* Spacer so the bar never covers the footer's last row on mobile. */}
      <div className="h-16 md:hidden" />

      {/* Overlays */}
      <Lightbox
        images={property.gallery.map((src, i) => ({
          src,
          alt: `${property.title} — image ${i + 1}`,
        }))}
        index={lightbox}
        onChange={setLightbox}
        onClose={() => setLightbox(null)}
      />

      <Lightbox
        images={planImage ? [{ src: planImage, alt: `${property.title} plan` }] : []}
        index={planImage ? 0 : null}
        onChange={() => undefined}
        onClose={() => setPlanImage(null)}
      />

      {property.video && (
        <Dialog
          open={videoOpen}
          onClose={() => setVideoOpen(false)}
          title={`${property.title} walkthrough`}
          hideTitle
          size="xl"
          className="bg-ink"
        >
          <div className="aspect-video w-full">
            <iframe
              src={property.video}
              title={`${property.title} walkthrough`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </Dialog>
      )}
    </>
  );
}
