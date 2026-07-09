"use client";

import Link from "next/link";
import { Loader2, ShieldAlert, KeyRound } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export function LoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-cream/40">
      <div className="flex flex-col items-center gap-3 text-muted">
        <Loader2 size={26} className="animate-spin text-gold" />
        <p className="text-[0.7rem] uppercase tracking-[0.2em]">Loading…</p>
      </div>
    </div>
  );
}

export function UnauthorizedScreen() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md border border-line bg-white p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert size={26} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-light">Access denied</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Your role doesn&apos;t have permission to view this section. Contact a Super Admin if you
          believe this is a mistake.
        </p>
        <Link href="/admin/dashboard" className="mt-6 inline-block">
          <AdminButton variant="ghost">Back to Dashboard</AdminButton>
        </Link>
      </div>
    </div>
  );
}

/** Full-screen gate shown when a user must change their password before proceeding. */
export function ForceChangePasswordScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-cream/40 px-4 py-10">
      <div className="w-full max-w-md border border-line bg-white p-8">
        <span className="flex h-11 w-11 items-center justify-center bg-gold/10 text-gold">
          <KeyRound size={20} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-light">Set a new password</h1>
        <p className="mt-1.5 text-sm text-muted">
          For security, please change the default password before using the CMS.
        </p>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
