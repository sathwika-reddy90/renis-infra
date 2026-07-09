"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

const HIGHLIGHTS = [
  "Gated 3-acre address on Road No. 45",
  "4 & 5 BHK sky residences from 4,200 sq.ft.",
  "Private lift lobbies & double-height decks",
  "Minutes from the city's finest dining & retail",
];

export default function JubileeHighlight() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section id="jubilee" ref={ref} className="relative overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ y }} className="absolute inset-0 -top-[12%] h-[124%]">
        <Image
          src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=2000&q=80"
          alt="The Aureate, Jubilee Hills"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

      <Container className="relative z-10 py-28 md:py-40">
        <div className="max-w-xl text-white">
          <Reveal>
            <span className="eyebrow flex items-center gap-3 text-gold-soft">
              <span className="h-px w-8 bg-gold" />
              Flagship · Jubilee Hills
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 font-display text-4xl font-light leading-[1.05] md:text-6xl">
              The Aureate
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-[1rem] leading-relaxed text-white/80">
              Our most exclusive address — a limited collection of sky residences
              in the heart of Jubilee Hills, where privacy, provenance and
              panoramic views come as standard.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <ul className="mt-9 space-y-4">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex items-start gap-3 text-[0.95rem] text-white/85">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-gold text-black">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-11">
              <Button href="#contact" variant="gold">
                Request Private Preview
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
