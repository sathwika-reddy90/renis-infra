"use client";

import { motion } from "framer-motion";
import { Waves, Sparkles, ConciergeBell, Trees, Building2, Dumbbell, type LucideIcon } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useAmenities } from "@/lib/query/hooks";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

// Maps an amenity's `icon` key (data) to a lucide component (UI).
const ICONS: Record<string, LucideIcon> = {
  pool: Waves,
  spa: Sparkles,
  concierge: ConciergeBell,
  gardens: Trees,
  lobby: Building2,
  fitness: Dumbbell,
};

function AmenitiesSkeleton() {
  return (
    <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-background p-10">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="mt-6 h-6 w-2/3" />
          <Skeleton className="mt-3 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function Amenities() {
  const query = useAmenities();

  return (
    <section id="amenities" className="bg-background py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Curated Living"
          title={
            <>
              Premium <span className="italic text-gold">Amenities</span>
            </>
          }
          description="Every residence is served by a suite of world-class facilities, designed to make the everyday feel effortless."
        />

        <QueryView query={query} skeleton={<AmenitiesSkeleton />}>
          {(amenities) => (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3"
            >
              {amenities.map((item) => {
                const Icon = ICONS[item.icon] ?? Sparkles;
                return (
                  <motion.div
                    key={item.id}
                    variants={fadeUp}
                    className="group bg-background p-10 transition-colors duration-500 hover:bg-cream"
                  >
                    <Icon
                      size={30}
                      strokeWidth={1.2}
                      className="text-gold transition-transform duration-500 ease-[var(--ease-lux)] group-hover:-translate-y-1"
                    />
                    <h3 className="mt-6 font-display text-2xl font-light">{item.title}</h3>
                    <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">{item.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </QueryView>
      </Container>
    </section>
  );
}
