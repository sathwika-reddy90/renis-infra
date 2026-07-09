"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { easeLux } from "@/lib/motion";

export default function Hero() {
  return (
    <section id="home" className="relative flex h-svh min-h-[640px] items-center overflow-hidden">
      {/* Background image with slow zoom (parallax feel) */}
      <motion.div
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: easeLux }}
        className="absolute inset-0"
      >
        <Image
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=80"
          alt="RENISINFRA luxury residence at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="absolute inset-0 bg-black/10" />

      <Container className="relative z-10">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.3 }}
            className="eyebrow flex items-center gap-3 text-gold-soft"
          >
            <span className="h-px w-10 bg-gold" />
            Luxury Residences · Hyderabad
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easeLux, delay: 0.45 }}
            className="mt-6 font-display text-5xl font-light leading-[1.02] text-white md:text-7xl lg:text-[5.2rem]"
          >
            Where an Address
            <br />
            Becomes a <span className="italic text-gold-soft">Legacy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeLux, delay: 0.6 }}
            className="mt-7 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
          >
            RENISINFRA crafts landmark homes for those who measure life in
            detail — architecture, craftsmanship and an address that endures.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeLux, delay: 0.75 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Button href="#projects" variant="gold">
              Explore Residences
            </Button>
            <Button href="#contact" variant="outline">
              Schedule a Visit
            </Button>
          </motion.div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <motion.a
        href="#projects"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70"
      >
        <span className="text-[0.65rem] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={20} />
        </motion.span>
      </motion.a>
    </section>
  );
}
