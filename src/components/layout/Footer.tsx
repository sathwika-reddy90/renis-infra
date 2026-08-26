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
  { label: "Awards & Recognition", href: "/awards" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
];

const heading = "text-[14px] font-medium uppercase tracking-[0.15em] text-white";
const link = "text-[14px] text-white/65 transition-colors duration-[var(--duration-base)] hover:text-white";

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
    <footer className="border-t border-white/10 bg-[#333333] text-white">
      {/* Brand + social — logo upper-left, follow-us upper-right. */}
      <Container className="flex flex-col gap-8 pt-14 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" className="inline-flex items-center" aria-label="RENIESINFRA home">
            {data?.logo ? (
              <Image
                src={data.logo}
                alt={data.siteName || "RENIESINFRA"}
                width={200}
                height={48}
                className="h-11 w-auto object-contain"
              />
            ) : (
              <span className="flex items-baseline leading-none">
                <span className="text-3xl font-extrabold italic tracking-tight text-[#C9A878]">
                  RENIES
                </span>
                <span className="ml-2 text-xl font-extrabold italic tracking-tight text-white">
                  infra
                </span>
              </span>
            )}
          </Link>
          <p className="mt-5 max-w-sm text-body-sm text-white/60">
            Crafting landmark luxury residences where architecture, craftsmanship and address
            meet.
          </p>
        </div>

        {socials.length > 0 && (
          <div className="sm:text-right">
            <p className={heading}>Follow Us On:</p>
            <div className="mt-4 flex gap-3 sm:justify-end">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-[var(--duration-base)] hover:border-gold hover:text-gold"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* Navigation — 4 evenly-spaced columns, left-aligned. */}
      <Container className="grid grid-cols-1 gap-x-8 gap-y-10 pb-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Projects — live from the CMS. */}
        <div>
          <h4 className={heading}>Projects</h4>
          <ul className="mt-4 space-y-3">
            <li>
              <Link href="/projects" className={link}>
                All Projects
              </Link>
            </li>
            {featured.map((p) => (
              <li key={p.id}>
                <Link href={p.href} className={link}>
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Explore */}
        <div>
          <h4 className={heading}>Explore</h4>
          <ul className="mt-4 space-y-3">
            {MEDIA_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Locations — from /admin/content → Offices. */}
        {offices.length > 0 && (
          <div>
            <h4 className={heading}>Locations</h4>
            <ul className="mt-4 space-y-3">
              {offices.map((office) => (
                <li key={office.city}>
                  <Link href="/contact" className={link}>
                    {office.city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact */}
        <div>
          <h4 className={heading}>Get in Touch</h4>
          <ul className="mt-4 space-y-4 text-[14px] text-white/65">
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
              <a href={`mailto:${contact.email}`} className="break-all transition-colors hover:text-white">
                {contact.email}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      {/* Latest launches — horizontal strip, not a card. */}
      {launches.length > 0 && (
        <div className="border-t border-white/10">
          <Container className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:gap-10">
            <h4 className={`shrink-0 ${heading}`}>Latest Launches</h4>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              {launches.map((p) => (
                <Link
                  key={p.id}
                  href={p.href}
                  className="group inline-flex items-center gap-2 text-[14px] text-white/65 transition-colors duration-[var(--duration-base)] hover:text-white"
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
          </Container>
        </div>
      )}

      {/* Copyright bar. */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-[0.78rem] text-white/45 md:flex-row">
          <p>
            © {new Date().getFullYear()} {data?.siteName ?? "RENIESINFRA"}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}
