"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Container from "@/components/ui/Container";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useTeam } from "@/lib/query/hooks";
import type { TeamMember } from "@/types/team";

function FounderSkeleton() {
  return (
    <Container>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <Skeleton className="h-[320px] w-full md:h-[500px]" />
        <div className="flex flex-col justify-center gap-4 bg-white p-8 md:p-10">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-11 w-52" />
        </div>
      </div>
    </Container>
  );
}

// Featured leader spotlighted on the homepage — picks whoever is tagged
// Founder/Chairman in the live team list, falling back to the first member.
function pickFounder(team: TeamMember[]): TeamMember | undefined {
  return team.find((m) => /founder|chairman/i.test(m.role)) ?? team[0];
}

// Structural clone of the Danube "Founder & Chairman" CTA block: light grey
// section, image filling the left half, a white content panel filling the
// right half (equal height, vertically centered content) with a small
// uppercase title, a large serif name, and a dark rectangular CTA button
// directly beneath it.
export default function Founder() {
  const query = useTeam();
  const [watching, setWatching] = useState(false);

  return (
    <section id="founder" className="bg-gray-50 py-16 md:py-24">
      <QueryView query={query} skeleton={<FounderSkeleton />} errorMessage="Unable to load leadership details right now.">
        {(team) => {
          const founder = pickFounder(team);
          if (!founder) return null;

          return (
            <>
              <Container>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative min-h-[320px] md:min-h-[500px]">
                    <Image
                      src={founder.image}
                      alt={founder.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-center bg-white p-8 md:p-10 lg:p-12">
                    <span className="text-[15px] font-medium uppercase tracking-[0.16em] text-muted md:text-[17px]">
                      Founder &amp; Chairman of RENISINFRA
                    </span>
                    <h2 className="mt-6 font-display text-4xl font-light uppercase tracking-[0.02em] text-gold md:text-5xl">
                      {founder.name}
                    </h2>
                    <button
                      onClick={() => setWatching(true)}
                      className="mt-8 w-fit bg-[#555555] px-6 py-3 text-[13px] font-medium uppercase tracking-[0.1em] text-white transition-colors duration-300 hover:bg-ink"
                    >
                      Watch Complete Story
                    </button>
                  </div>
                </div>
              </Container>

              <AnimatePresence>
                {watching && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6"
                    onClick={() => setWatching(false)}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3 }}
                      onClick={(e) => e.stopPropagation()}
                      className="relative flex aspect-video w-full max-w-3xl items-center justify-center border border-white/10 bg-ink text-white/70"
                    >
                      <button
                        aria-label="Close"
                        onClick={() => setWatching(false)}
                        className="absolute right-4 top-4 text-white/70 transition-colors hover:text-white"
                      >
                        <X size={22} />
                      </button>
                      <p className="px-10 text-center text-sm uppercase tracking-[0.2em]">
                        Founder&apos;s story video coming soon
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          );
        }}
      </QueryView>
    </section>
  );
}
