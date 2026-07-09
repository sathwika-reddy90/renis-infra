"use client";

import type { LucideIcon } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

export default function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  loading: boolean;
}) {
  return (
    <div className="flex items-start justify-between border border-line bg-white p-5">
      <div>
        <p className="text-[0.64rem] uppercase tracking-[0.2em] text-muted">{label}</p>
        {loading ? (
          <Skeleton className="mt-3 h-9 w-14" />
        ) : (
          <p className="mt-1.5 font-display text-4xl font-light">{value ?? "—"}</p>
        )}
      </div>
      <span className="flex h-10 w-10 flex-none items-center justify-center bg-gold/10 text-gold">
        <Icon size={18} strokeWidth={1.5} />
      </span>
    </div>
  );
}
