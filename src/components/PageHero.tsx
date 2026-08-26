"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { easeLux } from "@/lib/motion";

type Crumb = { label: string; href?: string };

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  breadcrumb,
  /** "brand" swaps the eyebrow/title font family to the Inter-label +
   *  Libertinus-serif system used on the homepage (Why/Founder/Reviews/
   *  Awards). Defaults to the original cinematic Playfay treatment so
   *  every other PageHero consumer (contact, blog, privacy, terms) is
   *  unaffected. */
  variant = "cinematic",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  image: string;
  breadcrumb?: Crumb[];
  variant?: "cinematic" | "brand";
}) {
  return (
    <section
      data-hero-dark
      className="relative flex min-h-[62vh] items-center overflow-hidden"
    >
      <motion.div
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.2, ease: easeLux }}
        className="absolute inset-0"
      >
        <Image src={image} alt={typeof title === "string" ? title : "RENIESINFRA"} fill priority sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/75" />

      <Container className="relative z-10 pt-24 text-center">
        {eyebrow && (
          <motion.span
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeLux, delay: 0.2 }}
            className={cn(
              "eyebrow flex items-center justify-center gap-3 text-gold-soft",
              variant === "brand" && "[font-family:var(--font-nav),sans-serif]",
            )}
          >
            <span className="h-px w-8 bg-gold" />
            {eyebrow}
            <span className="h-px w-8 bg-gold" />
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeLux, delay: 0.32 }}
          className={cn(
            "mx-auto mt-5 max-w-4xl text-display-1 text-white",
            variant === "brand" ? "[font-family:var(--font-launch),sans-serif]" : "font-display",
          )}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.44 }}
            className="mx-auto mt-6 max-w-xl text-body-lg text-white/80"
          >
            {subtitle}
          </motion.p>
        )}
        {breadcrumb && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-8 flex items-center justify-center gap-2 text-[0.72rem] uppercase tracking-[0.22em] text-white/60"
          >
            {breadcrumb.map((c, i) => (
              <span key={c.label} className="flex items-center gap-2">
                {c.href ? (
                  <Link href={c.href} className="transition-colors hover:text-gold">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-gold-soft">{c.label}</span>
                )}
                {i < breadcrumb.length - 1 && <span className="text-white/30">/</span>}
              </span>
            ))}
          </motion.nav>
        )}
      </Container>
    </section>
  );
}
