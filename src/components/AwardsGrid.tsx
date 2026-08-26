"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export interface Award {
  id: string;
  image: string;
  date: string;
  title: string;
}

// Demo content — no dedicated awards CMS model exists yet; swap for a real
// data source if one is added later. Shared by the homepage teaser
// (AwardsRecognition) and the full /awards page so both stay in sync.
export const AWARDS: Award[] = [
  {
    id: "award-2026",
    image: "/images/placeholder-project.jpg",
    date: "2026",
    title: "Best Luxury Residential Developer",
  },
  {
    id: "award-2025-a",
    image: "/images/placeholder-blog.jpg",
    date: "2025",
    title: "Excellence in Real Estate Development",
  },
  {
    id: "award-2025-b",
    image: "/images/placeholder-project.jpg",
    date: "2025",
    title: "Outstanding Architectural Design",
  },
  {
    id: "award-2024",
    image: "/images/placeholder-blog.jpg",
    date: "2024",
    title: "Best Premium Residential Project",
  },
];

export default function AwardsGrid({ items }: { items: Award[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((award) => (
        <motion.div key={award.id} variants={fadeUp} className="text-left">
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            <Image
              src={award.image}
              alt={award.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
          <p className="mt-4 text-[13px] font-medium uppercase tracking-[0.14em] text-[#bda588] [font-family:var(--font-nav),sans-serif]">
            {award.date}
          </p>
          <h3 className="mt-1 font-display text-lg font-medium leading-snug text-[#4a4b4b]">
            {award.title}
          </h3>
        </motion.div>
      ))}
    </motion.div>
  );
}
