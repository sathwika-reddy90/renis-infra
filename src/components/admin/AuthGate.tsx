"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/admin/AuthProvider";
import { can, type Resource } from "@/lib/admin/permissions";
import AdminShell from "@/components/admin/AdminShell";
import { LoadingScreen, UnauthorizedScreen, ForceChangePasswordScreen } from "./AuthScreens";

const LOGIN_ROUTE = "/admin/login";

// Management pages gated by write permission on their resource.
const ROUTE_RESOURCE: { prefix: string; resource: Resource }[] = [
  { prefix: "/admin/properties", resource: "properties" },
  { prefix: "/admin/gallery", resource: "gallery" },
  { prefix: "/admin/blogs", resource: "blogs" },
  { prefix: "/admin/team", resource: "team" },
  { prefix: "/admin/testimonials", resource: "testimonials" },
  { prefix: "/admin/faqs", resource: "faqs" },
  { prefix: "/admin/amenities", resource: "amenities" },
  { prefix: "/admin/media", resource: "media" },
  { prefix: "/admin/inquiries", resource: "inquiries" },
  { prefix: "/admin/settings", resource: "settings" },
  { prefix: "/admin/content", resource: "settings" },
];

function routeResource(pathname: string): Resource | null {
  return ROUTE_RESOURCE.find((r) => pathname.startsWith(r.prefix))?.resource ?? null;
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginRoute = pathname === LOGIN_ROUTE;
  const authenticated = status === "authenticated" && user !== null;

  // Redirect side-effects (never navigate during render).
  useEffect(() => {
    if (status === "loading") return;
    if (!authenticated && !isLoginRoute) router.replace(LOGIN_ROUTE);
    if (authenticated && isLoginRoute && !user?.mustChangePassword) {
      router.replace("/admin/dashboard");
    }
  }, [status, authenticated, isLoginRoute, user?.mustChangePassword, router]);

  if (status === "loading") return <LoadingScreen />;

  // Login page renders full-screen without the admin chrome.
  if (isLoginRoute) {
    if (authenticated && !user?.mustChangePassword) return <LoadingScreen />;
    return <>{children}</>;
  }

  if (!authenticated) return <LoadingScreen />;

  // First-login (or admin-forced) password change blocks the whole CMS.
  if (user.mustChangePassword) return <ForceChangePasswordScreen />;

  const resource = routeResource(pathname);
  const allowed = !resource || can(user.role, resource, "write");

  return <AdminShell>{allowed ? children : <UnauthorizedScreen />}</AdminShell>;
}
