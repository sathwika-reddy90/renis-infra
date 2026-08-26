"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, Gift } from "lucide-react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { fadeUpSm, stagger } from "@/lib/motion";
import { useOffers } from "@/lib/query/hooks";
import type { Offer } from "@/types/offer";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ValidityRange({ startDate, endDate }: { startDate?: string; endDate?: string }) {
  if (!startDate && !endDate) return null;
  const label = startDate && endDate
    ? `${formatDate(startDate)} – ${formatDate(endDate)}`
    : startDate
      ? `From ${formatDate(startDate)}`
      : `Until ${formatDate(endDate!)}`;
  return (
    <p className="mt-4 flex items-center gap-1.5 text-[0.78rem] text-muted">
      <CalendarDays size={13} className="text-gold" aria-hidden /> {label}
    </p>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <motion.article
      variants={fadeUpSm}
      className="group flex flex-col overflow-hidden border border-line bg-white transition-shadow duration-[var(--duration-slow)] hover:shadow-[var(--shadow-lift)]"
    >
      {offer.image ? (
        <div className="relative aspect-[4/3] w-full flex-none overflow-hidden bg-line/40">
          <Image
            src={offer.image}
            alt={offer.title}
            fill
            sizes="(max-width: 640px) 100vw, 380px"
            className="object-cover transition-transform duration-[var(--duration-cinematic)] ease-[var(--ease-lux)] group-hover:scale-105"
          />
          <span className="absolute left-0 top-0 bg-gold px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white">
            {offer.discount}
          </span>
        </div>
      ) : (
        <span className="mx-6 mt-6 inline-flex w-fit items-center gap-1.5 bg-gold/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold">
          <Gift size={12} aria-hidden /> {offer.discount}
        </span>
      )}

      <div className="flex flex-1 flex-col p-6">
        <span aria-hidden className="h-px w-8 bg-gold" />
        <h3 className="mt-3 font-display text-h4 font-medium text-ink">{offer.title}</h3>
        <p className="mt-2 text-body-sm text-muted">{offer.description}</p>
        <ValidityRange startDate={offer.startDate} endDate={offer.endDate} />
        {offer.ctaText && offer.ctaLink && (
          <Button href={offer.ctaLink} variant="gold" size="sm" className="mt-5 w-fit">
            {offer.ctaText}
          </Button>
        )}
      </div>
    </motion.article>
  );
}

function PanelSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <Gift size={32} className="text-gold" strokeWidth={1.2} aria-hidden />
      <p className="mt-4 font-display text-h4 font-medium text-ink">No offers available today</p>
      <p className="mt-1.5 text-body-sm text-muted">Check back soon for our latest offers.</p>
    </div>
  );
}

export default function DailyOffersPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const query = useOffers();

  return (
    <Dialog open={open} onClose={onClose} title="Daily Offers" hideTitle size="xl">
      <div className="text-center">
        <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-gold">
          <span aria-hidden className="h-px w-6 bg-gold" />
          Exclusive
          <span aria-hidden className="h-px w-6 bg-gold" />
        </span>
        <h2 className="mt-4 text-[26px] font-normal uppercase tracking-[3px] text-[#bda588] [font-family:var(--font-launch),sans-serif] sm:text-[32px]">
          Daily Offers
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-[14px] text-muted [font-family:var(--font-nav),sans-serif]">
          Exclusive opportunities, thoughtfully curated for you.
        </p>
      </div>

      <div className="mt-8 border-t border-line" />

      <div className="mt-8">
        <QueryView query={query} skeleton={<PanelSkeleton />} errorMessage="Unable to load offers right now.">
          {(offers) => {
            const active = offers
              .filter((o) => o.status === "ACTIVE")
              .sort((a, b) => a.priority - b.priority);

            if (active.length === 0) return <EmptyState />;

            return (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2"
              >
                {active.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </motion.div>
            );
          }}
        </QueryView>
      </div>
    </Dialog>
  );
}
