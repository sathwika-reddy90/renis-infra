"use client";

import Link from "next/link";
import { Instagram, Facebook, Linkedin, Youtube } from "@/components/ui/SocialIcons";
import Container from "@/components/ui/Container";
import { useSiteSettings } from "@/lib/query/hooks";
import { CONTACT, OFFICES } from "@/config/company";
import { LATEST_LAUNCH } from "@/config/latestLaunch";

const PROJECT_LINKS = [
  { label: "All Projects", href: "/projects" },
  { label: LATEST_LAUNCH.name, href: LATEST_LAUNCH.discoverHref },
  { label: "Jubilee Hills", href: "/projects/jubilee-hills" },
];

const MEDIA_LINKS = [
  { label: "Gallery", href: "/gallery" },
  { label: "News & Events", href: "/blog" },
];

export default function Footer() {
  // Live from the CMS (Settings), config as the graceful fallback while
  // loading or if the API is unreachable — same pattern as ContactCTA.
  const { data } = useSiteSettings();
  const contact = data ?? CONTACT;

  const socials = [
    { icon: Instagram, href: data?.instagram },
    { icon: Facebook, href: data?.facebook },
    { icon: Linkedin, href: data?.linkedin },
    { icon: Youtube, href: data?.youtube },
  ].filter((s): s is { icon: typeof Instagram; href: string } => Boolean(s.href));

  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="font-display text-3xl font-semibold tracking-[0.12em]">
              RENIS<span className="text-gold">INFRA</span>
            </Link>
            <p className="mt-5 max-w-sm text-[0.92rem] leading-relaxed text-white/60">
              Crafting landmark luxury residences where architecture,
              craftsmanship and address meet.
            </p>
            {socials.length > 0 && (
              <div className="mt-7 flex gap-3">
                {socials.map(({ icon: Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-300 hover:border-gold hover:text-gold"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div>
            <h4 className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">Projects</h4>
            <ul className="mt-5 space-y-3">
              {PROJECT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[0.92rem] text-white/65 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Media */}
          <div>
            <h4 className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">Media</h4>
            <ul className="mt-5 space-y-3">
              {MEDIA_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[0.92rem] text-white/65 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">Locations</h4>
            <ul className="mt-5 space-y-3">
              {OFFICES.map((office) => (
                <li key={office.city}>
                  <a
                    href="/contact"
                    className="text-[0.92rem] text-white/65 transition-colors duration-300 hover:text-white"
                  >
                    {office.city}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">Get in Touch</h4>
            <ul className="mt-5 space-y-3 text-[0.92rem] text-white/65">
              <li>{contact.address}</li>
              <li>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-white">
                  {contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="transition-colors hover:text-white">
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Latest launches strip */}
        <div className="mt-14 border-t border-white/10 pt-10">
          <h4 className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">Latest Launches</h4>
          <div className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
            <a
              href={LATEST_LAUNCH.discoverHref}
              className="text-[0.92rem] text-white/65 transition-colors duration-300 hover:text-white"
            >
              {LATEST_LAUNCH.name} — Now Open for Registrations
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-[0.78rem] text-white/45 md:flex-row">
          <p>© {new Date().getFullYear()} RENISINFRA. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-white">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-white">Terms of Use</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
