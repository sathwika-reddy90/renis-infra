"use client";

import Container from "@/components/ui/Container";
import { ParallaxImage } from "@/components/ui/Parallax";
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
//
// `rhythmClassName` replaces the default vertical padding wholesale — the
// homepage passes a reduced bottom padding so this block flows into the
// Reviews section directly beneath it (same grey band); the About page uses
// the default.
export default function Founder({
  rhythmClassName = "py-16 md:py-24",
}: {
  rhythmClassName?: string;
}) {
  const query = useTeam();

  return (
    <section id="founder" className={`bg-gray-50 ${rhythmClassName}`}>
      <QueryView query={query} skeleton={<FounderSkeleton />} errorMessage="Unable to load leadership details right now.">
        {(team) => {
          const founder = pickFounder(team);
          if (!founder) return null;

          return (
            <Container>
              <div className="grid grid-cols-1 md:grid-cols-2">
                <ParallaxImage
                  src="/images/placeholder-project.jpg"
                  alt={founder.name}
                  speed={8}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="min-h-[320px] md:min-h-[500px]"
                />

                <div className="flex flex-col items-center justify-center bg-white p-8 text-center md:p-10 lg:p-12">
                  <span className="whitespace-nowrap text-[18px] font-medium uppercase tracking-[0.18em] text-[#4d4d4d] [font-family:var(--font-nav),sans-serif] max-xl:whitespace-normal">
                    Founder &amp; Chairman of RENIESINFRA
                  </span>
                  <h2 className="mt-2 text-4xl font-normal uppercase tracking-[0.04em] text-[#bda588] [font-family:var(--font-launch),sans-serif] md:text-5xl">
                    {founder.name}
                  </h2>
                </div>
              </div>
            </Container>
          );
        }}
      </QueryView>
    </section>
  );
}
