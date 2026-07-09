"use client";

import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useTeam } from "@/lib/query/hooks";

function GridSkeleton() {
  return (
    <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] w-full" />
      ))}
    </div>
  );
}

export default function LeadershipGrid() {
  const query = useTeam();

  return (
    <QueryView query={query} skeleton={<GridSkeleton />}>
      {(team) => (
        <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {team.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06}>
              <div className="group relative aspect-[4/5] overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover grayscale transition-all duration-700 ease-[var(--ease-lux)] group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-display text-xl font-light">{p.name}</p>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-gold-soft">{p.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </QueryView>
  );
}
