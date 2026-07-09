import { cn } from "@/lib/cn";

// Neutral shimmer block used to compose section-specific loading states.
export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-line/70", className)} />;
}
