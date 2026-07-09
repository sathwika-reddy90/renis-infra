"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import StatCounter from "@/components/ui/StatCounter";
import { STATS as WHY } from "@/config/company";
import { imageReveal, fadeUp, stagger, viewportOnce } from "@/lib/motion";

export default function WhyRenisinfra() {
  return (
    <section id="why" className="bg-cream py-24 md:py-32">
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Image with clip reveal + framed gold border */}
        <div className="relative">
          <motion.div
            variants={imageReveal}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="relative aspect-[4/5] w-full overflow-hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1100&q=80"
              alt="A RENISINFRA interior detail"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
          <div className="pointer-events-none absolute -bottom-5 -right-5 hidden h-40 w-40 border border-gold md:block" />
        </div>

        {/* Copy + stats */}
        <div>
          <Reveal>
            <span className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              Why RENISINFRA
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] md:text-5xl">
              An uncompromising standard,
              <br />
              built into every square foot.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-lg text-[0.98rem] leading-relaxed text-muted">
              For nearly two decades we have delivered homes defined by enduring
              design, honest engineering and a service culture that treats every
              resident as a lifelong client.
            </p>
          </Reveal>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10"
          >
            {WHY.map((item) => (
              <motion.div key={item.label} variants={fadeUp} className="border-l border-line pl-5">
                <div className="font-display text-4xl font-light md:text-5xl">
                  <StatCounter value={item.stat} />
                </div>
                <p className="mt-2 text-[0.78rem] uppercase tracking-[0.16em] text-muted">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
