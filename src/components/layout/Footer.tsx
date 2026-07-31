"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Instagram, Facebook, Linkedin, Youtube } from "@/components/ui/SocialIcons";
import Container from "@/components/ui/Container";
import { useProjects, useSiteContent, useSiteSettings } from "@/lib/query/hooks";
import { CONTACT } from "@/config/company";

const MEDIA_LINKS = [
  { label: "Gallery", href: "/gallery" },
  { label: "News & Events", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
];

export default function Footer() {
  // Live from the CMS (Settings), config as the graceful fallback while
  // loading or if the API is unreachable — same pattern as ContactCTA.
  const { data } = useSiteSettings();
  const { data: content } = useSiteContent();
  const { data: projects } = useProjects();
  const contact = data ?? CONTACT;
  const offices = content?.offices ?? [];

  const socials = [
    { icon: Instagram, href: data?.instagram, label: "Instagram" },
    { icon: Facebook, href: data?.facebook, label: "Facebook" },
    { icon: Linkedin, href: data?.linkedin, label: "LinkedIn" },
    { icon: Youtube, href: data?.youtube, label: "YouTube" },
  ].filter((s): s is { icon: typeof Instagram; href: string; label: string } => Boolean(s.href));

  const featured = (projects ?? []).slice(0, 5);
  const launches = (projects ?? []).filter((p) => p.status === "New Launch").slice(0, 4);

  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <Container className="py-section-sm">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="sm:col-span-2">
            <Link href="/" className="inline-flex items-center" aria-label="RENISINFRA home">
              {data?.logo ? (
                <Image
                  src={data.logo}
                  alt={data.siteName || "RENISINFRA"}
                  width={200}
                  height={48}
                  className="h-11 w-auto object-contain"
                />
              ) : (
                <span className="font-display text-3xl font-semibold tracking-[0.12em]">
                  RENIS<span className="text-gold">INFRA</span>
                </span>
              )}
            </Link>

            <p className="mt-5 max-w-sm text-body-sm text-white/60">
              Crafting landmark luxury residences where architecture, craftsmanship and address
              meet.
            </p>

            {socials.length > 0 && (
              <div className="mt-7 flex gap-3">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-[var(--duration-base)] hover:border-gold hover:text-gold"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Projects — live from the CMS. */}
          <div>
            <h4 className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">Projects</h4>
            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  href="/projects"
                  className="text-body-sm text-white/65 transition-colors duration-[var(--duration-base)] hover:text-white"
                >
                  All Projects
                </Link>
              </li>
              {featured.map((p) => (
                <li key={p.id}>
                  <Link
                    href={p.href}
                    className="text-body-sm text-white/65 transition-colors duration-[var(--duration-base)] hover:text-white"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Media */}
          <div>
            <h4 className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">Explore</h4>
            <ul className="mt-5 space-y-3">
              {MEDIA_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-white/65 transition-colors duration-[var(--duration-base)] hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations — from /admin/content → Offices. */}
          {offices.length > 0 && (
            <div>
              <h4 className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">Locations</h4>
              <ul className="mt-5 space-y-3">
                {offices.map((office) => (
                  <li key={office.city}>
                    <Link
                      href="/contact"
                      className="text-body-sm text-white/65 transition-colors duration-[var(--duration-base)] hover:text-white"
                    >
                      {office.city}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div>
            <h4 className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">Get in Touch</h4>
            <ul className="mt-5 space-y-4 text-body-sm text-white/65">
              <li className="flex gap-3">
                <MapPin size={15} className="mt-1 flex-none text-gold" aria-hidden />
                <span>{contact.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone size={15} className="mt-0.5 flex-none text-gold" aria-hidden />
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-white"
                >
                  {contact.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail size={15} className="mt-0.5 flex-none text-gold" aria-hidden />
                <a
                  href={`mailto:${contact.email}`}
                  className="break-all transition-colors hover:text-white"
                >
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Latest launches strip — hidden entirely when nothing is launching. */}
        {launches.length > 0 && (
          <div className="mt-14 border-t border-white/10 pt-10">
            <h4 className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">
              Latest Launches
            </h4>
            <div className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
              {launches.map((p) => (
                <Link
                  key={p.id}
                  href={p.href}
                  className="group inline-flex items-center gap-2 text-body-sm text-white/65 transition-colors duration-[var(--duration-base)] hover:text-white"
                >
                  {p.title} — Now Open for Registrations
                  <ArrowUpRight
                    size={14}
                    aria-hidden
                    className="text-gold transition-transform duration-[var(--duration-base)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-[0.78rem] text-white/45 md:flex-row">
          <p>© {new Date().getFullYear()} {data?.siteName ?? "RENISINFRA"}. All rights reserved.</p>
          <div className="flex gap-6">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
