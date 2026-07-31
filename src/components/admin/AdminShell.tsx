"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Images,
  Newspaper,
  Users,
  Quote,
  HelpCircle,
  Sparkles,
  Inbox,
  Settings,
  LayoutTemplate,
  FolderOpen,
  Menu,
  X,
  ExternalLink,
  LogOut,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/admin/AuthProvider";
import { can, ROLE_LABEL, type Resource } from "@/lib/admin/permissions";

type NavItem = { label: string; href: string; icon: LucideIcon; resource?: Resource };

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/admin/properties", icon: Building2, resource: "properties" },
  { label: "Gallery", href: "/admin/gallery", icon: Images, resource: "gallery" },
  { label: "Blogs", href: "/admin/blogs", icon: Newspaper, resource: "blogs" },
  { label: "Team", href: "/admin/team", icon: Users, resource: "team" },
  { label: "Testimonials", href: "/admin/testimonials", icon: Quote, resource: "testimonials" },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle, resource: "faqs" },
  { label: "Amenities", href: "/admin/amenities", icon: Sparkles, resource: "amenities" },
  { label: "Media", href: "/admin/media", icon: FolderOpen, resource: "media" },
  { label: "Inquiries", href: "/admin/inquiries", icon: Inbox, resource: "inquiries" },
  { label: "Content", href: "/admin/content", icon: LayoutTemplate, resource: "settings" },
  { label: "Settings", href: "/admin/settings", icon: Settings, resource: "settings" },
];

function NavLinks({
  pathname,
  items,
  onNavigate,
}: {
  pathname: string;
  items: NavItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      {items.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-[0.78rem] tracking-[0.06em] transition-colors duration-300",
              active
                ? "border-l-2 border-gold bg-white/5 text-white"
                : "border-l-2 border-transparent text-white/60 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon size={16} className={active ? "text-gold" : ""} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <div className="flex flex-none items-center justify-between border-b border-white/10 px-5 py-5">
      <Link href="/admin/dashboard" className="font-display text-xl font-semibold tracking-[0.12em] text-white">
        RENIS<span className="text-gold">INFRA</span>
      </Link>
      <span className="border border-gold/40 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.2em] text-gold">
        CMS
      </span>
    </div>
  );
}

function UserPanel({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="flex-none border-t border-white/10 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gold/15 text-xs font-medium uppercase text-gold">
          {user.name.slice(0, 2)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[0.8rem] text-white">{user.name}</p>
          <p className="truncate text-[0.6rem] uppercase tracking-[0.14em] text-gold">
            {ROLE_LABEL[user.role]}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <Link
          href="/admin/change-password"
          className="flex items-center gap-2 px-1 py-1.5 text-[0.66rem] uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-gold"
        >
          <KeyRound size={13} /> Change Password
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-1 py-1.5 text-[0.66rem] uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-gold"
        >
          <ExternalLink size={13} /> View Website
        </a>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-1 py-1.5 text-[0.66rem] uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-red-400"
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const items = NAV.filter((n) => !n.resource || (user && can(user.role, n.resource, "write")));
  const title =
    NAV.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))?.label ??
    (pathname.startsWith("/admin/change-password") ? "Change Password" : "Admin");

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  return (
    <div className="flex min-h-svh w-full bg-cream/40">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-ink lg:flex">
        <SidebarBrand />
        <NavLinks pathname={pathname} items={items} />
        <UserPanel onLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-64 flex-col bg-ink"
            >
              <SidebarBrand />
              <NavLinks pathname={pathname} items={items} onNavigate={() => setOpen(false)} />
              <UserPanel onLogout={handleLogout} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-line bg-white/95 px-4 py-3.5 backdrop-blur md:px-8">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="text-ink lg:hidden">
            <Menu size={22} />
          </button>
          <h1 className="font-display text-2xl font-light">{title}</h1>
          <div className="ml-auto flex items-center gap-4">
            {user && (
              <span className="hidden text-[0.68rem] uppercase tracking-[0.16em] text-muted sm:inline">
                {ROLE_LABEL[user.role]}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-muted transition-colors hover:text-red-600"
            >
              <LogOut size={13} /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
          <button aria-label="Close menu" onClick={() => setOpen(false)} className={cn("lg:hidden", open ? "" : "hidden")}>
            <X size={20} />
          </button>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
