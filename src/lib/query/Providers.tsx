"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { makeQueryClient } from "./queryClient";

// One QueryClient per browser session (created lazily, kept across re-renders).
// Server-prefetched data is hydrated per route group via <HydrationBoundary>
// (see src/app/(site)/layout.tsx), not here — the admin app has no prefetch.
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {/*
        Framer animates via WAAPI/rAF, so the global `prefers-reduced-motion`
        CSS block does not reach it — every scroll reveal on the site ran
        regardless of the OS setting unless a component wired useReducedMotion
        by hand. `reducedMotion="user"` drops transform and layout animation
        for those users while keeping opacity, so content still announces
        itself without moving.
      */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </QueryClientProvider>
  );
}
