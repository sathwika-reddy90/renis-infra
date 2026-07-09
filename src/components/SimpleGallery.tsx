"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Lightbox from "@/components/ui/Lightbox";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

// A responsive image grid wired to the shared Lightbox.
export default function SimpleGallery({
  images,
  columns = "md:grid-cols-3",
}: {
  images: string[];
  columns?: string;
}) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className={`grid grid-cols-2 gap-4 ${columns}`}
      >
        {images.map((src, i) => (
          <motion.button
            key={src + i}
            variants={fadeUp}
            onClick={() => setIndex(i)}
            className="group relative aspect-[4/3] overflow-hidden"
          >
            <Image
              src={src}
              alt={`Gallery image ${i + 1}`}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-[1.1s] ease-[var(--ease-lux)] group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-500 group-hover:bg-black/35">
              <span className="flex h-11 w-11 scale-75 items-center justify-center rounded-full border border-white/70 text-white opacity-0 transition-all duration-500 ease-[var(--ease-lux)] group-hover:scale-100 group-hover:opacity-100">
                <Plus size={18} />
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <Lightbox images={images} index={index} onChange={setIndex} onClose={() => setIndex(null)} />
    </>
  );
}
