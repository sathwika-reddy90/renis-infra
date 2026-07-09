"use client";

import { createContext, useContext, useMemo, useState } from "react";
import ScheduleVisitModal from "@/components/ScheduleVisitModal";

interface ScheduleVisitContextValue {
  openVisitModal: () => void;
}

const ScheduleVisitContext = createContext<ScheduleVisitContextValue | null>(null);

/** Site-wide "Schedule a Visit" modal — mounted once, opened from any CTA. */
export function ScheduleVisitProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ openVisitModal: () => setOpen(true) }), []);

  return (
    <ScheduleVisitContext.Provider value={value}>
      {children}
      <ScheduleVisitModal open={open} onClose={() => setOpen(false)} />
    </ScheduleVisitContext.Provider>
  );
}

export function useScheduleVisit(): ScheduleVisitContextValue {
  const ctx = useContext(ScheduleVisitContext);
  if (!ctx) throw new Error("useScheduleVisit must be used inside <ScheduleVisitProvider>");
  return ctx;
}
