import type { Metadata } from "next";
import { AuthProvider } from "@/lib/admin/AuthProvider";
import AuthGate from "@/components/admin/AuthGate";
import { ToastProvider } from "@/components/admin/Toast";

export const metadata: Metadata = {
  title: "Admin CMS — RENISINFRA",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuthGate>{children}</AuthGate>
      </AuthProvider>
    </ToastProvider>
  );
}
