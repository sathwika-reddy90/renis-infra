"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import Lightbox from "@/components/ui/Lightbox";
import ErrorState from "@/components/ui/ErrorState";
import { cn } from "@/lib/cn";
import { easeLux } from "@/lib/motion";
import { useGallery } from "@/lib/query/hooks";
import { GALLERY_CATEGORIES, type GalleryCategory } from "@/types/gallery";

function MasonrySkeleton() {
  const heights = ["h-64", "h-48", "h-56", "h-72", "h-52", "h-60"];
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
      {heights.map((h, i) => (
        <div key={i} className={`w-full animate-pulse rounded bg-line/70 ${h} break-inside-avoid`} />
      ))}
    </div>
  );
}

export default function GalleryClient() {
  const query = useGallery();
  const [cat, setCat] = useState<GalleryCategory>("All");
  const [index, setIndex] = useState<number | null>(null);

  const all = useMemo(() => query.data ?? [], [query.data]);
  const items = useMemo(
    () => (cat === "All" ? all : all.filter((g) => g.category === cat)),
    [all, cat],
  );
  const sources = items.map((i) => i.src);

  return (
    <section className="bg-background py-20 md:py-28">
      <Container>
        {/* Category filter */}
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {GALLERY_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCat(c);
                setIndex(null);
              }}
              className={cn(
                "px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.18em] transition-colors duration-300",
                cat === c
                  ? "bg-ink text-white"
                  : "border border-line text-muted hover:border-gold hover:text-ink",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {query.isPending ? (
          <MasonrySkeleton />
        ) : query.isError ? (
          <ErrorState
            message="We couldn't load the gallery right now."
            onRetry={() => void query.refetch()}
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={cat}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4"
            >
              {items.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: easeLux, delay: (i % 6) * 0.05 }}
                  onClick={() => setIndex(i)}
                  className="group relative block w-full overflow-hidden break-inside-avoid"
                >
                  {/* Plain img keeps true masonry heights + native lazy loading */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-[1.1s] ease-[var(--ease-lux)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-500 group-hover:bg-black/35">
                    <span className="flex h-11 w-11 scale-75 items-center justify-center rounded-full border border-white/70 text-white opacity-0 transition-all duration-500 ease-[var(--ease-lux)] group-hover:scale-100 group-hover:opacity-100">
                      <Plus size={18} />
                    </span>
                  </div>
                  <span className="absolute left-4 top-4 text-[0.62rem] uppercase tracking-[0.2em] text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {item.category}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        <Lightbox images={sources} index={index} onChange={setIndex} onClose={() => setIndex(null)} />
      </Container>
    </section>
  );
}
