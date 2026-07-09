"use client";

import Image from "next/image";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useProjects } from "@/lib/query/hooks";

function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

export default function FeaturedProjectSection() {
  const query = useProjects();

  return (
    <section className="bg-cream py-24 md:py-32">
      <Container>
        <QueryView query={query} skeleton={<FeaturedSkeleton />}>
          {(projects) => {
            const featured = projects[0];
            if (!featured) return null;
            return (
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <Reveal className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={featured.featuredImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </Reveal>
                <div>
                  <Reveal>
                    <span className="eyebrow flex items-center gap-3">
                      <span className="h-px w-8 bg-gold" />
                      Featured Development
                    </span>
                  </Reveal>
                  <Reveal delay={0.05}>
                    <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] md:text-5xl">
                      {featured.title}
                    </h2>
                  </Reveal>
                  <Reveal delay={0.1}>
                    <p className="mt-3 text-[0.82rem] uppercase tracking-[0.2em] text-gold">
                      {featured.subtitle} · {featured.location}
                    </p>
                  </Reveal>
                  <Reveal delay={0.12}>
                    <p className="mt-6 max-w-lg text-[0.98rem] leading-relaxed text-muted">
                      Our flagship address — a limited collection of sky residences where privacy,
                      provenance and panoramic views come as standard. Prices from {featured.priceLabel}.
                    </p>
                  </Reveal>
                  <Reveal delay={0.16}>
                    <div className="mt-9 flex flex-wrap gap-4">
                      <Button href="/projects/jubilee-hills" variant="gold">
                        View Flagship
                      </Button>
                      <Button href="/contact" variant="ghost">
                        Enquire
                      </Button>
                    </div>
                  </Reveal>
                </div>
              </div>
            );
          }}
        </QueryView>
      </Container>
    </section>
  );
}
