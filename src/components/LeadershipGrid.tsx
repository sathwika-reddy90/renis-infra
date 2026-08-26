"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { ParallaxImage } from "@/components/ui/Parallax";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useTeam } from "@/lib/query/hooks";
import type { TeamMember } from "@/types/team";

function CardSkeleton() {
  return (
    <div className="mt-14 grid grid-cols-1 md:grid-cols-2">
      <Skeleton className="h-[320px] w-full md:h-[500px]" />
      <div className="flex flex-col justify-center gap-4 bg-white p-8 md:p-10">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-11 w-52" />
      </div>
    </div>
  );
}

// Same person the homepage highlights — tagged Founder/Chairman in the live
// team list, falling back to the first member.
function pickFounder(team: TeamMember[]): TeamMember | undefined {
  return team.find((m) => /founder|chairman/i.test(m.role)) ?? team[0];
}

/**
 * Single spotlighted leader, styled as an exact match of the homepage
 * Founder section's card (image left, name/title panel right, "Watch
 * Complete Story" CTA) — not a multi-person grid.
 */
export default function LeadershipGrid() {
  const query = useTeam();
  const [watching, setWatching] = useState(false);

  return (
    <QueryView query={query} skeleton={<CardSkeleton />}>
      {(team) => {
        const founder = pickFounder(team);
        if (!founder) return null;

        return (
          <>
            <Reveal className="mt-14">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <ParallaxImage
                  src="/images/placeholder-project.jpg"
                  alt={founder.name}
                  speed={8}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="min-h-[320px] md:min-h-[500px]"
                />

                <div className="flex flex-col items-center justify-center bg-white p-8 text-center md:p-10 lg:p-12">
                  <span className="whitespace-nowrap text-[18px] font-medium uppercase tracking-[0.18em] text-[#4d4d4d] [font-family:var(--font-nav),sans-serif]">
                    Founder &amp; Chairman of RENIESINFRA
                  </span>
                  <h2 className="mt-2 text-4xl font-normal uppercase tracking-[0.04em] text-[#bda588] [font-family:var(--font-launch),sans-serif] md:text-5xl">
                    {founder.name}
                  </h2>
                  <button
                    onClick={() => setWatching(true)}
                    className="mt-5 bg-[#555555] px-5 py-2.5 text-sm font-medium uppercase tracking-[0.1em] text-white transition-colors duration-300 hover:bg-ink [font-family:var(--font-nav),sans-serif]"
                  >
                    Watch Complete Story
                  </button>
                </div>
              </div>
            </Reveal>

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
  );
}
