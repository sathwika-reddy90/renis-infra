"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import EnquiryForm from "@/components/EnquiryForm";
import { useSiteSettings } from "@/lib/query/hooks";
import { CONTACT } from "@/config/company";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const tel = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;

const CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80";

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
    <section id="contact" className="bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Form */}
        <div className="flex flex-col justify-center px-6 py-24 md:px-10 md:py-32 lg:px-16">
          <SectionHeading
            align="left"
            eyebrow="Begin the Conversation"
            title={
              <>
                Schedule a private viewing of your{" "}
                <span className="italic text-gold">future address</span>.
              </>
            }
            description="Complete the form and a residence advisor will be in touch within one business day."
          />

          <Reveal delay={0.1} className="mt-10 max-w-lg">
            <EnquiryForm />
          </Reveal>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-14 flex flex-wrap gap-x-10 gap-y-6"
          >
            {details.map(({ icon: Icon, label, value, href }) => {
              const inner = (
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-cream text-gold">
                    <Icon size={17} strokeWidth={1.4} />
                  </span>
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">{label}</p>
                    <p className="text-[0.92rem] text-ink">{value}</p>
                  </div>
                </div>
              );
              return (
                <motion.div key={label} variants={fadeUp}>
                  {href ? <a href={href}>{inner}</a> : inner}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Image */}
        <div className="relative min-h-[360px] lg:min-h-full">
          <Image
            src={CONTACT_IMAGE}
            alt="A RENIESINFRA residence"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent lg:bg-gradient-to-l" />
        </div>
      </div>
    </section>
  );
}
