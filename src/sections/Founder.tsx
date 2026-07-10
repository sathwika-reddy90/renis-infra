"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { PlayCircle, X } from "lucide-react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useTeam } from "@/lib/query/hooks";
import { easeLux } from "@/lib/motion";
import type { TeamMember } from "@/types/team";

const panelReveal: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  show: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: easeLux } },
};

function FounderSkeleton() {
  return (
    <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    </Container>
  );
}

// Featured leader spotlighted on the homepage — picks whoever is tagged
// Founder/Chairman in the live team list, falling back to the first member.
function pickFounder(team: TeamMember[]): TeamMember | undefined {
  return (
    team.find((m) => /founder|chairman/i.test(m.role)) ?? team[0]
  );
}

export default function Founder() {
  const query = useTeam();
  const [watching, setWatching] = useState(false);

  return (
    <section id="founder" className="bg-background py-24 md:py-32">
      <QueryView query={query} skeleton={<FounderSkeleton />} errorMessage="Unable to load leadership details right now.">
        {(team) => {
          const founder = pickFounder(team);
          if (!founder) return null;

          return (
            <>
              <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
                <div className="relative">
                  <Reveal
                    variants={panelReveal}
                    className="relative aspect-[4/5] w-full overflow-hidden"
                  >
                    <Image
                      src={founder.image}
                      alt={founder.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </Reveal>
                  <div className="pointer-events-none absolute -bottom-5 -left-5 hidden h-40 w-40 border border-gold md:block" />
                </div>

                <div>
                  <Reveal>
                    <span className="eyebrow flex items-center gap-3">
                      <span className="h-px w-8 bg-gold" />
                      Leadership
                    </span>
                  </Reveal>
                  <Reveal delay={0.05}>
                    <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] md:text-5xl">
                      {founder.name}
                    </h2>
                  </Reveal>
                  <Reveal delay={0.08}>
                    <p className="mt-2 text-[0.8rem] uppercase tracking-[0.2em] text-gold">
                      {founder.role}
                    </p>
                  </Reveal>
                  {founder.bio && (
                    <Reveal delay={0.14}>
                      <p className="mt-6 max-w-lg text-[0.98rem] leading-relaxed text-muted">
                        {founder.bio}
                      </p>
                    </Reveal>
                  )}

                  <Reveal delay={0.2}>
                    <div className="mt-9">
                      <Button onClick={() => setWatching(true)} variant="ghost" className="gap-2.5">
                        <PlayCircle size={18} />
                        Watch Story
                      </Button>
                    </div>
                  </Reveal>
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
