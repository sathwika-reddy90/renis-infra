"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { NEWS_ITEMS } from "@/config/news";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export default function NewsEvents() {
  return (
    <section id="news" className="bg-cream py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Stay Informed"
          title={
            <>
              News <span className="italic text-gold">&amp; Events</span>
            </>
          }
          description="The latest from RENISINFRA — launches, milestones and moments worth sharing."
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {NEWS_ITEMS.map((item) => (
            <motion.a key={item.id} href={item.href} variants={fadeUp} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-[1.1s] ease-[var(--ease-lux)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute right-4 top-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-gold text-white opacity-0 transition-all duration-500 ease-[var(--ease-lux)] group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight size={16} />
                </span>
              </div>
              <p className="mt-4 text-[0.7rem] uppercase tracking-[0.2em] text-gold">{item.date}</p>
              <h3 className="mt-2 font-display text-xl font-light leading-snug text-ink">
                {item.title}
              </h3>
            </motion.a>
          ))}
        </motion.div>

        <div className="mt-14 flex justify-center">
          <Button href="/gallery" variant="ghost">
            View More
          </Button>
        </div>
      </Container>
    </section>
  );
}
