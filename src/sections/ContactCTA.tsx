"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { useSiteSettings } from "@/lib/query/hooks";
import { CONTACT } from "@/config/company";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const tel = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;

export default function ContactCTA() {
  // Live site settings when available, config as the graceful fallback.
  const { data } = useSiteSettings();
  const contact = data ?? CONTACT;

  const details = [
    { icon: Phone, label: "Call", value: contact.phone, href: tel(contact.phone) },
    { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { icon: MapPin, label: "Visit", value: contact.address, href: undefined },
  ];

  return (
    <section id="contact" className="relative overflow-hidden bg-ink py-24 text-white md:py-32">
      {/* Soft gold radial accents */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

      <Container className="relative z-10 text-center">
        <Reveal>
          <span className="eyebrow flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            Begin the Conversation
            <span className="h-px w-8 bg-gold" />
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-light leading-[1.05] md:text-6xl">
            Schedule a private viewing of your future address.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-[1rem] leading-relaxed text-white/70">
            Our residence advisors are available to arrange a personalised tour
            at a time that suits you.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href={tel(contact.phone)} variant="gold">
              Schedule a Visit
            </Button>
            <Button href={`mailto:${contact.email}`} variant="outline">
              Enquire Now
            </Button>
          </div>
        </Reveal>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3"
        >
          {details.map(({ icon: Icon, label, value, href }) => {
            const inner = (
              <div className="flex h-full flex-col items-center gap-3 bg-ink px-6 py-10 transition-colors duration-500 hover:bg-white/[0.03]">
                <Icon size={24} strokeWidth={1.3} className="text-gold" />
                <p className="text-[0.7rem] uppercase tracking-[0.24em] text-white/50">{label}</p>
                <p className="text-sm text-white/85">{value}</p>
              </div>
            );
            return (
              <motion.div key={label} variants={fadeUp}>
                {href ? <a href={href}>{inner}</a> : inner}
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
