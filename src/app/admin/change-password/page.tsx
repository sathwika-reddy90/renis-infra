"use client";

import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <div className="max-w-md">
      <p className="mb-6 text-sm text-muted">
        Choose a strong password. You&apos;ll stay signed in on this device after updating.
      </p>
      <div className="border border-line bg-white p-6 md:p-8">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
