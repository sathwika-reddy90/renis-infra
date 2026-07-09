"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectCard from "@/components/ProjectCard";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useProjects } from "@/lib/query/hooks";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

function GridSkeleton() {
  return (
    <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] w-full" />
      ))}
    </div>
  );
}

export default function FeaturedProjects() {
  const query = useProjects();

  return (
    <section id="projects" className="bg-background py-24 md:py-32">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            align="left"
            eyebrow="Featured Portfolio"
            title={
              <>
                Signature <span className="italic text-gold">Residences</span>
              </>
            }
          />
          <p className="max-w-sm text-[0.95rem] leading-relaxed text-muted md:pb-3">
            A curated collection of landmark developments defining Hyderabad&apos;s
            most coveted neighbourhoods.
          </p>
        </div>

        <QueryView query={query} skeleton={<GridSkeleton />}>
          {(projects) => (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
            >
              {projects.slice(0, 3).map((project) => (
                <motion.div key={project.id} variants={fadeUp}>
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </QueryView>
      </Container>
    </section>
  );
}
