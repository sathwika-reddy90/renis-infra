"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Controlled fullscreen lightbox. Parent owns `index` (null = closed).
export default function Lightbox({
  images,
  index,
  onChange,
  onClose,
}: {
  images: string[];
  index: number | null;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const open = index !== null;

  const go = useCallback(
    (dir: number) => {
      if (index === null) return;
      onChange((index + dir + images.length) % images.length);
    },
    [index, images.length, onChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go, onClose]);

  return (
    <AnimatePresence>
      {open && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 md:p-10"
          onClick={onClose}
        >
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-gold hover:text-gold"
          >
            <X size={20} />
          </button>

          <button
            aria-label="Previous"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-gold hover:text-gold md:left-8"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            aria-label="Next"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-gold hover:text-gold md:right-8"
          >
            <ChevronRight size={22} />
          </button>

          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-[70vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={images[index]} alt={`Image ${index + 1}`} fill sizes="90vw" className="object-contain" />
          </motion.div>

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[0.75rem] tracking-[0.2em] text-white/60">
            {index + 1} / {images.length}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
