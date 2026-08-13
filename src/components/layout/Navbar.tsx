"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { startLenis, stopLenis } from "@/lib/lenis";
import { easeLux } from "@/lib/motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useScheduleVisit } from "@/components/ScheduleVisitContext";
import { useProjects, useSiteContent, useSiteSettings } from "@/lib/query/hooks";
import type { Project } from "@/types/project";

/** Status buckets for the projects mega-menu, in sales-funnel order. */
const MENU_GROUPS = ["New Launch", "Now Selling", "Ready to Move", "Coming Soon"] as const;

/** Rendered until CMS nav loads, so the header is never empty on first paint. */
const FALLBACK_NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Renis Projects", href: "/renis-projects" },
  { label: "About", href: "/about" },
  { label: "Media", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

const RENIS_PROJECTS = { label: "Renis Projects", href: "/renis-projects" };

/**
 * The nav is CMS-managed, so a code-only entry would be invisible the moment
 * `content.nav` loads. This slots "Renis Projects" in right after "Projects"
 * whichever list is in play, and no-ops once the item is added in the CMS —
 * at which point this helper can go.
 */
function withRenisProjects(links: { label: string; href: string }[]) {
  if (links.some((l) => l.href === RENIS_PROJECTS.href)) return links;
  const after = links.findIndex((l) => l.href === "/projects");
  if (after === -1) return [...links, RENIS_PROJECTS];
  return [...links.slice(0, after + 1), RENIS_PROJECTS, ...links.slice(after + 1)];
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [overDarkHero, setOverDarkHero] = useState(false);
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [trackedPath, setTrackedPath] = useState<string | null>(null);
  const pathname = usePathname();
  const { openVisitModal } = useScheduleVisit();
  const { data: settings } = useSiteSettings();
  const { data: content } = useSiteContent();
  const { data: projects } = useProjects();
  const navLinks = withRenisProjects(content?.nav?.length ? content.nav : FALLBACK_NAV);
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
    setOverDarkHero(false);
    setOpen(false);
    setMegaOpen(false);
  }

  /*
   * Nav links are white, so a transparent header is only legible over a dark
   * hero. Pages opt in by marking their hero `data-hero-dark`; anything else
   * keeps the solid treatment (the default above). Previously the links were
   * unconditionally white and survived only because every page happened to
   * have a dark hero.
   */
  useEffect(() => {
    const heroes = Array.from(document.querySelectorAll("[data-hero-dark]"));
    if (heroes.length === 0) return;

    // A page can have more than one dark panel — the homepage has the opening
    // curtain and the pinned reel — so track how many currently sit under the
    // header rather than watching only the first.
    const active = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) active.add(entry.target);
          else active.delete(entry.target);
        }
        setOverDarkHero(active.size > 0);
      },
      // Only the band directly beneath the header matters.
      { rootMargin: "-80px 0px -100% 0px", threshold: 0 },
    );
    heroes.forEach((hero) => observer.observe(hero));
    return () => observer.disconnect();
  }, [pathname]);

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
  const solid = scrolled || open || megaOpen || !overDarkHero;

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
          "fixed inset-x-0 top-0 transition-all duration-[var(--duration-slow)] ease-[var(--ease-lux)]",
          // Height tracks scroll only. The dark-hero check resolves one frame
          // after mount, so letting it drive padding too would jump the layout.
          scrolled || open ? "py-3" : "py-6",
          solid
            ? "bg-ink/95 shadow-[0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md"
            : "bg-transparent",
        )}
        style={{ zIndex: "var(--z-header)" }}
      >
        <Container className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="RENISINFRA home">
            {settings?.logo ? (
              <Image
                src={settings.logo}
                alt={settings.siteName || "RENISINFRA"}
                width={160}
                height={40}
                priority
                className="h-9 w-auto object-contain"
              />
            ) : (
              <span className="font-display text-2xl font-semibold tracking-[0.12em] text-white">
                RENIS<span className="text-gold">INFRA</span>
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
            {navLinks.map((link) => {
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
                      "group relative flex items-center gap-1.5 text-[0.82rem] tracking-[0.06em] text-white/85 transition-colors duration-[var(--duration-base)] hover:text-white",
                      isActive(link.href) && "text-white",
                    )}
                  >
                    {link.label}
                    {isProjects && grouped.length > 0 && (
                      <ChevronDown
                        size={13}
                        aria-hidden
                        className={cn(
                          "transition-transform duration-[var(--duration-base)]",
                          megaOpen && "rotate-180",
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-[var(--duration-base)] ease-[var(--ease-lux)]",
                        isActive(link.href) ? "w-full" : "w-0 group-hover:w-full",
                      )}
                    />
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button href="/contact" variant="outline" size="sm">
              Contact Us
            </Button>
            <Button onClick={openVisitModal} variant="gold" size="sm">
              Schedule a Visit
            </Button>
          </div>

          {/* Mobile toggle */}
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
                      "border-b border-white/10 py-3 text-sm tracking-[0.06em] transition-colors",
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
