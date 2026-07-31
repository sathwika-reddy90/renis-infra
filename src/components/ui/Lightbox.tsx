"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { easeLux } from "@/lib/motion";
import { useOverlay } from "@/lib/useOverlay";

export interface LightboxImage {
  src: string;
  alt?: string;
  caption?: string;
}

/** Accepts plain URLs or captioned objects. */
type Source = string | LightboxImage;

const normalise = (s: Source): LightboxImage => (typeof s === "string" ? { src: s } : s);

// Controlled fullscreen lightbox. Parent owns `index` (null = closed).
export default function Lightbox({
  images,
  index,
  onChange,
  onClose,
}: {
  images: Source[];
  index: number | null;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const open = index !== null;
  const panelRef = useOverlay(open, onClose);
  const railRef = useRef<HTMLDivElement>(null);
  const items = images.map(normalise);

  const go = useCallback(
    (dir: number) => {
      if (index === null || images.length === 0) return;
      onChange((index + dir + images.length) % images.length);
    },
    [index, images.length, onChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  // Keep the active thumbnail visible as the user pages through.
  useEffect(() => {
    if (index === null) return;
    railRef.current
      ?.querySelector<HTMLElement>(`[data-thumb="${index}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  const current = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {open && index !== null && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-ink/95 p-4 md:p-10"
          style={{ zIndex: "var(--z-modal)" }}
          onClick={onClose}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Image ${index + 1} of ${images.length}`}
            tabIndex={-1}
            className="contents outline-none"
          >
            <button
              type="button"
              aria-label="Close gallery"
              onClick={onClose}
              className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-gold hover:text-gold"
            >
              <X size={20} aria-hidden />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-gold hover:text-gold md:left-8"
                >
                  <ChevronLeft size={22} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-gold hover:text-gold md:right-8"
                >
                  <ChevronRight size={22} aria-hidden />
                </button>
              </>
            )}

            <motion.div
              key={index}
              drag={images.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                // Commit on either a decisive flick or a long drag.
                if (info.offset.x < -80 || info.velocity.x < -450) go(1);
                else if (info.offset.x > 80 || info.velocity.x > 450) go(-1);
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: easeLux }}
              className="relative h-[62vh] w-full max-w-5xl cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={current.src}
                alt={current.alt ?? `Image ${index + 1} of ${images.length}`}
                fill
                sizes="90vw"
                draggable={false}
                className="object-contain"
              />
            </motion.div>

            {current.caption && (
              <p className="mt-5 max-w-2xl text-center text-body-sm text-white/70">
                {current.caption}
              </p>
            )}

            {images.length > 1 && (
              <div
                ref={railRef}
                onClick={(e) => e.stopPropagation()}
                className="no-scrollbar mask-edges-x mt-6 flex max-w-full gap-2 overflow-x-auto px-2"
              >
                {items.map((img, i) => (
                  <button
                    key={`${img.src}-${i}`}
                    type="button"
                    data-thumb={i}
                    aria-label={`Go to image ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => onChange(i)}
                    className={cn(
                      "relative h-14 w-20 flex-none overflow-hidden border transition-all duration-[var(--duration-base)]",
                      i === index
                        ? "border-gold opacity-100"
                        : "border-transparent opacity-45 hover:opacity-80",
                    )}
                  >
                    <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <span className="mt-4 text-[0.75rem] tracking-[0.2em] text-white/60">
              {index + 1} / {images.length}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
