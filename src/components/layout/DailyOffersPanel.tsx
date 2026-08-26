"use client";

import Image from "next/image";
import { CalendarDays, Gift } from "lucide-react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
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
    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
      <CalendarDays size={13} aria-hidden /> {label}
    </p>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <article className="flex flex-col overflow-hidden border border-line sm:flex-row">
      {offer.image && (
        <div className="relative h-40 flex-none sm:h-auto sm:w-40">
          <Image
            src={offer.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 160px"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <span className="inline-flex w-fit items-center gap-1.5 bg-gold/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold">
          <Gift size={12} aria-hidden /> {offer.discount}
        </span>
        <h3 className="mt-3 font-display text-h4 font-medium text-ink">{offer.title}</h3>
        <p className="mt-1.5 text-body-sm text-muted">{offer.description}</p>
        <ValidityRange startDate={offer.startDate} endDate={offer.endDate} />
        {offer.ctaText && offer.ctaLink && (
          <Button href={offer.ctaLink} variant="gold" size="sm" className="mt-4 w-fit">
            {offer.ctaText}
          </Button>
        )}
      </div>
    </article>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
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
    <Dialog open={open} onClose={onClose} title="Daily Offers" size="md">
      <QueryView query={query} skeleton={<PanelSkeleton />} errorMessage="Unable to load offers right now.">
        {(offers) => {
          const active = offers
            .filter((o) => o.status === "ACTIVE")
            .sort((a, b) => a.priority - b.priority);

          if (active.length === 0) return <EmptyState />;

          return (
            <div className="space-y-4">
              {active.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          );
        }}
      </QueryView>
    </Dialog>
  );
}
