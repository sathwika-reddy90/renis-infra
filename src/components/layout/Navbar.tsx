"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/config/navigation";
import { cn } from "@/lib/cn";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useScheduleVisit } from "@/components/ScheduleVisitContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { openVisitModal } = useScheduleVisit();

  // Toggle solid navbar past the hero fold.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href;
  const solid = scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[var(--ease-lux)]",
        solid
          ? "bg-ink/95 py-3 shadow-[0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md"
          : "bg-transparent py-6",
      )}
    >
      <Container className="flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-[0.12em] text-white transition-colors"
        >
          RENIS<span className="text-gold">INFRA</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative text-[0.82rem] tracking-[0.06em] text-white/85 transition-colors duration-300 hover:text-white",
                isActive(link.href) && "text-white",
              )}
            >
              {link.label}
              <span
                className={cn(
                  "absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-300 ease-[var(--ease-lux)]",
                  isActive(link.href) ? "w-full" : "w-0 group-hover:w-full",
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button href="/contact" variant="outline" className="px-6 py-3">
            Contact Us
          </Button>
          <Button onClick={openVisitModal} variant="gold" className="px-6 py-3">
            Schedule a Visit
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
          className="text-white lg:hidden"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </Container>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-ink lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-6">
              {NAV_LINKS.map((link) => (
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
              <div className="flex flex-col gap-3 pt-5">
                <Button href="/contact" onClick={() => setOpen(false)} variant="outline" className="w-full">
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
  );
}
