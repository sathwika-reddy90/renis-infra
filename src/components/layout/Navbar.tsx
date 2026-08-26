"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { startLenis, stopLenis } from "@/lib/lenis";
import { easeLux } from "@/lib/motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useScheduleVisit } from "@/components/ScheduleVisitContext";
import { useProjects, useSiteContent } from "@/lib/query/hooks";
import type { Project } from "@/types/project";

/** Status buckets for the projects mega-menu, in sales-funnel order. */
const MENU_GROUPS = ["New Launch", "Now Selling", "Ready to Move", "Coming Soon"] as const;

/** Rendered until CMS nav loads, so the header is never empty on first paint. */
const FALLBACK_NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Renies Project", href: "/renis-projects" },
  { label: "About", href: "/about" },
  { label: "Media", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

const RENIS_PROJECT = { label: "Renies Project", href: "/renis-projects" };

/** WhatsApp deep link built from the site phone number. */
const WHATSAPP_HREF = "https://wa.me/919000012345";

/* Inline WhatsApp glyph — lucide ships no brand icons. */
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.83 9.83 0 0 0 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

/**
 * Header presentation of the CMS nav: the logo covers Home and the CONTACT US
 * button covers Contact, so both drop out of the link row. Hrefs are
 * otherwise untouched.
 */
function toHeaderNav(links: { label: string; href: string }[]) {
  return links
    .filter((l) => l.href !== "/" && l.href !== "/contact")
    .map((l) => {
      if (l.href === "/about") return { ...l, label: "About Us" };
      return l;
    });
}

/**
 * The nav is CMS-managed, so a code-only entry would be invisible the moment
 * `content.nav` loads. This slots "Renies Project" in right after "Projects"
 * whichever list is in play, and no-ops once the item is added in the CMS —
 * at which point this helper can go.
 */
function withRenisProject(links: { label: string; href: string }[]) {
  if (links.some((l) => l.href === RENIS_PROJECT.href)) return links;
  const after = links.findIndex((l) => l.href === "/projects");
  if (after === -1) return [...links, RENIS_PROJECT];
  return [...links.slice(0, after + 1), RENIS_PROJECT, ...links.slice(after + 1)];
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [trackedPath, setTrackedPath] = useState<string | null>(null);
  const pathname = usePathname();
  const { openVisitModal } = useScheduleVisit();
  const { data: content } = useSiteContent();
  const { data: projects } = useProjects();
  const navLinks = withRenisProject(content?.nav?.length ? content.nav : FALLBACK_NAV);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  // Toggle solid navbar past the fold.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /*
   * Reset per-route state on navigation. React's documented "adjust state
   * during render" pattern — doing this in an effect instead would queue a
   * second render pass on every route change.
   */
  if (trackedPath !== pathname) {
    setTrackedPath(pathname);
    setOpen(false);
    setMegaOpen(false);
  }

  // Focus trap + Escape for the mobile drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Body overflow does not stop the virtual scroll; without this the page
    // behind the drawer keeps moving and snaps when the drawer closes.
    stopLenis();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      startLenis();
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const grouped = MENU_GROUPS.map((status) => ({
    status,
    items: (projects ?? []).filter((p: Project) => p.status === status).slice(0, 4),
  })).filter((g) => g.items.length > 0);

  /* Small delay on close so diagonal mouse travel into the panel doesn't drop it. */
  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleCloseMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 140);
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header
        onMouseLeave={scheduleCloseMega}
        className={cn(
          // Always the same solid navy shade — over the hero and over
          // light content alike, scrolled or not — so it never picks up a
          // tint from whatever photo or section is behind it.
          "fixed inset-x-0 top-0 bg-ink [font-family:var(--font-nav),sans-serif] transition-shadow duration-[var(--duration-slow)] ease-[var(--ease-lux)]",
          scrolled && "shadow-[0_1px_0_0_rgba(255,255,255,0.08)]",
        )}
        style={{ zIndex: "var(--z-header)" }}
      >
        <Container className="flex h-[4.5rem] items-center justify-between lg:h-20">
          {/* Compact header groups the menu toggle with the logo on the left,
              mirroring the reference layout. */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((o) => !o)}
              className="text-white lg:hidden"
            >
              {open ? <X size={26} aria-hidden /> : <Menu size={26} aria-hidden />}
            </button>
            <Link href="/" className="flex items-center gap-3" aria-label="RENIESINFRA home">
              <span className="flex items-baseline leading-none [font-family:var(--font-sans),sans-serif]">
                <span className="text-[2.05rem] font-extrabold italic tracking-tight text-[#C9A878] lg:text-[2.35rem]">
                  RENIES
                </span>
                <span className="ml-2 text-[1.2rem] font-extrabold italic tracking-tight text-white lg:text-[1.4rem]">
                  infra
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden items-center lg:flex">
            {toHeaderNav(navLinks).map((link) => {
              const isProjects = link.href === "/projects";
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={isProjects && grouped.length > 0 ? openMega : undefined}
                >
                  <Link
                    href={link.href}
                    aria-expanded={isProjects && grouped.length > 0 ? megaOpen : undefined}
                    className={cn(
                      "group relative flex items-center gap-1.5 px-[13px] py-[9px] text-[13px] font-medium uppercase tracking-[1.4px] text-white transition-opacity duration-[var(--duration-base)] hover:opacity-80",
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      size={13}
                      aria-hidden
                      className={cn(
                        "transition-transform duration-[var(--duration-base)]",
                        isProjects && megaOpen && "rotate-180",
                      )}
                    />
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/contact"
              className="inline-flex h-10 items-center gap-2 rounded-none border border-white px-[19px] text-[13px] font-medium uppercase tracking-[1.4px] text-white transition-colors duration-[var(--duration-base)] hover:bg-white/10"
            >
              <Phone size={14} aria-hidden />
              Contact Us
            </Link>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-none border border-[#24a052] bg-[#24a052] px-[19px] text-[13px] font-medium uppercase tracking-[1.4px] text-white transition-colors duration-[var(--duration-base)] hover:bg-[#1e8a45]"
            >
              <WhatsAppIcon size={16} />
              WhatsApp
            </a>
            <span className="ml-4 text-[13px] font-medium uppercase tracking-[1.4px] text-white">
              EN
            </span>
          </div>

          {/* Compact header right side: call + WhatsApp icons, per the
              reference layout. */}
          <div className="flex items-center gap-5 lg:hidden">
            <a href="tel:+919000012345" aria-label="Call us" className="text-white">
              <Phone size={20} aria-hidden />
            </a>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="text-[#3fae4c]"
            >
              <WhatsAppIcon size={22} />
            </a>
          </div>
        </Container>

        {/* Projects mega-menu */}
        <AnimatePresence>
          {megaOpen && grouped.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: easeLux }}
              onMouseEnter={openMega}
              className="absolute inset-x-0 top-full hidden border-t border-white/10 bg-ink/98 backdrop-blur-md lg:block"
            >
              <Container className="grid grid-cols-4 gap-10 py-10">
                {grouped.map((group) => (
                  <div key={group.status}>
                    <h3 className="text-[0.68rem] uppercase tracking-[0.24em] text-gold">
                      {group.status}
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {group.items.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={p.href}
                            className="block text-[0.9rem] text-white/70 transition-colors duration-[var(--duration-base)] hover:text-gold"
                          >
                            {p.title}
                            <span className="mt-0.5 block text-[0.75rem] text-white/40">
                              {p.location}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Container>
              <div className="border-t border-white/10">
                <Container className="py-4">
                  <Link
                    href="/projects"
                    className="text-[0.75rem] uppercase tracking-[0.2em] text-gold hover:underline"
                  >
                    View all projects →
                  </Link>
                </Container>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reading progress */}
        <motion.div
          aria-hidden
          style={{ scaleX: progress }}
          className={cn(
            "absolute inset-x-0 bottom-0 h-px origin-left bg-gold transition-opacity duration-[var(--duration-base)]",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Mobile drawer */}
        <AnimatePresence>
          {open && (
            <motion.nav
              id="mobile-nav"
              ref={drawerRef}
              aria-label="Mobile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: easeLux }}
              data-lenis-prevent
              className="max-h-[calc(100vh-4rem)] overflow-y-auto bg-ink lg:hidden"
            >
              <Container className="flex flex-col gap-1 py-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "border-b border-white/10 py-3 text-sm font-medium tracking-[0.06em] transition-colors",
                      isActive(link.href) ? "text-gold" : "text-white/80",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                {grouped.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-[0.66rem] uppercase tracking-[0.24em] text-gold">
                      Featured Projects
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {grouped.flatMap((g) => g.items).slice(0, 5).map((p) => (
                        <li key={p.id}>
                          <Link
                            href={p.href}
                            onClick={() => setOpen(false)}
                            className="block py-1 text-[0.88rem] text-white/65"
                          >
                            {p.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-6">
                  <Button
                    href="/contact"
                    onClick={() => setOpen(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Contact Us
                  </Button>
                  <Button
                    onClick={() => {
                      setOpen(false);
                      openVisitModal();
                    }}
                    variant="gold"
                    className="w-full"
                  >
                    Schedule a Visit
                  </Button>
                </div>
              </Container>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
