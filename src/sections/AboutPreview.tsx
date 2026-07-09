"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { imageReveal, viewportOnce } from "@/lib/motion";

export default function AboutPreview() {
  return (
    <section id="about" className="bg-background py-24 md:py-32">
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 lg:order-1">
          <Reveal>
            <span className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              Our Philosophy
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] md:text-5xl">
              Building for the
              <br />
              <span className="italic text-gold">generations</span> to come.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-lg text-[0.98rem] leading-relaxed text-muted">
              RENISINFRA was founded on a simple belief — that a home should
              appreciate not only in value, but in the quality of life it offers.
              We partner with acclaimed architects and craftspeople to build
              residences that remain relevant for decades.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 max-w-lg text-[0.98rem] leading-relaxed text-muted">
              Every project begins with the address and ends with the smallest of
              details — because both, we believe, define how a home is lived in.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-10">
              <Button href="#about" variant="ghost">
                Discover Our Story
              </Button>
            </div>
          </Reveal>
        </div>

        <motion.div
          variants={imageReveal}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative order-1 aspect-[5/4] w-full overflow-hidden lg:order-2"
        >
          <Image
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
            alt="RENISINFRA architecture"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
      </Container>
    </section>
  );
}
