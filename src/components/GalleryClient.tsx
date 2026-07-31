"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
        <div
          key={i}
          className={`w-full animate-pulse break-inside-avoid rounded bg-line/70 ${h}`}
        />
      ))}
    </div>
  );
}

const isCategory = (v: string | null): v is GalleryCategory =>
  v !== null && (GALLERY_CATEGORIES as readonly string[]).includes(v);

export default function GalleryClient() {
  const query = useGallery();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Category lives in the URL so a filtered view is linkable and shareable.
  const raw = params.get("category");
  const cat: GalleryCategory = isCategory(raw) ? raw : "All";
  const [index, setIndex] = useState<number | null>(null);

  const setCategory = useCallback(
    (next: GalleryCategory) => {
      const merged = new URLSearchParams(params.toString());
      if (next === "All") merged.delete("category");
      else merged.set("category", next);
      const qs = merged.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      setIndex(null);
    },
    [params, pathname, router],
  );

  const all = useMemo(() => query.data ?? [], [query.data]);
  const items = useMemo(
    () => (cat === "All" ? all : all.filter((g) => g.category === cat)),
    [all, cat],
  );

  // Captions carry through to the lightbox rather than being dropped.
  const sources = items.map((i) => ({ src: i.src, alt: i.alt, caption: i.alt }));

  return (
    <section className="bg-background py-section-sm">
      <Container>
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {GALLERY_CATEGORIES.map((c) => {
            const active = cat === c;
            const count = c === "All" ? all.length : all.filter((g) => g.category === c).length;
            // Hide empty categories rather than offering a dead filter.
            if (count === 0 && c !== "All") return null;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={active}
                className={cn(
                  "px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.18em] transition-colors duration-[var(--duration-base)]",
                  active
                    ? "bg-ink text-white"
                    : "border border-line text-muted hover:border-gold hover:text-ink",
                )}
              >
                {c}
                <span className={cn("ml-2", active ? "text-white/50" : "text-muted-light")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {query.isPending ? (
          <MasonrySkeleton />
        ) : query.isError ? (
          <ErrorState
            message="We couldn't load the gallery right now."
            onRetry={() => void query.refetch()}
          />
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-body text-muted">
            No images in this category yet.
          </p>
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
                  type="button"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: easeLux, delay: (i % 6) * 0.05 }}
                  onClick={() => setIndex(i)}
                  aria-label={`Open ${item.alt}`}
                  className="group relative block w-full break-inside-avoid overflow-hidden"
                >
                  {/* Plain img keeps true masonry heights + native lazy loading */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-[var(--duration-cinematic)] ease-[var(--ease-lux)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-[var(--duration-slow)] group-hover:bg-black/35">
                    <span className="flex h-11 w-11 scale-75 items-center justify-center rounded-full border border-white/70 text-white opacity-0 transition-all duration-[var(--duration-slow)] ease-[var(--ease-lux)] group-hover:scale-100 group-hover:opacity-100">
                      <Plus size={18} aria-hidden />
                    </span>
                  </div>
                  <span className="absolute left-4 top-4 text-[0.62rem] uppercase tracking-[0.2em] text-white opacity-0 transition-opacity duration-[var(--duration-slow)] group-hover:opacity-100">
                    {item.category}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        <Lightbox
          images={sources}
          index={index}
          onChange={setIndex}
          onClose={() => setIndex(null)}
        />
      </Container>
    </section>
  );
}
