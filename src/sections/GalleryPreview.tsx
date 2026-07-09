"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useGallery } from "@/lib/query/hooks";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

// Varied spans give the grid an editorial, gallery-wall rhythm.
const SPANS = ["md:col-span-2 md:row-span-2", "", "", "", "md:col-span-2", ""];

function GallerySkeleton() {
  return (
    <div className="mt-14 grid auto-rows-[220px] grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className={`h-full w-full ${SPANS[i]}`} />
      ))}
    </div>
  );
}

export default function GalleryPreview() {
  const query = useGallery();

  return (
    <section id="gallery" className="bg-cream py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="The Portfolio"
          title={
            <>
              A Study in <span className="italic text-gold">Detail</span>
            </>
          }
          description="Spaces, finishes and moments from across the RENISINFRA collection."
        />

        <QueryView query={query} skeleton={<GallerySkeleton />}>
          {(images) => (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="mt-14 grid auto-rows-[220px] grid-cols-2 gap-4 md:grid-cols-4"
            >
              {images.slice(0, 6).map((image, i) => (
                <motion.a
                  key={image.id}
                  href="#gallery"
                  variants={fadeUp}
                  className={`group relative overflow-hidden ${SPANS[i]}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-[1.1s] ease-[var(--ease-lux)] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-500 group-hover:bg-black/35">
                    <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full border border-white/70 text-white opacity-0 transition-all duration-500 ease-[var(--ease-lux)] group-hover:scale-100 group-hover:opacity-100">
                      <Plus size={18} />
                    </span>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          )}
        </QueryView>

        <div className="mt-12 flex justify-center">
          <Button href="#gallery" variant="ghost">
            View Full Gallery
          </Button>
        </div>
      </Container>
    </section>
  );
}
