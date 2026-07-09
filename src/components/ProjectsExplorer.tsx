"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import Container from "@/components/ui/Container";
import ProjectCard from "@/components/ProjectCard";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { fadeUp, stagger } from "@/lib/motion";
import { useProjects } from "@/lib/query/hooks";
import { PROJECT_TYPES, PROJECT_STATUSES, PROJECT_LOCATIONS } from "@/config/filters";

const PER_PAGE = 6;

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h4 className="text-[0.72rem] uppercase tracking-[0.22em] text-muted">{label}</h4>
      <div className="mt-4 flex flex-col gap-1">
        {["All", ...options].map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "group flex items-center gap-3 py-1.5 text-left text-sm transition-colors",
              value === opt ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            <span
              className={cn(
                "h-px transition-all duration-300 ease-[var(--ease-lux)]",
                value === opt ? "w-6 bg-gold" : "w-3 bg-line group-hover:w-6 group-hover:bg-gold",
              )}
            />
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] w-full" />
      ))}
    </div>
  );
}

export default function ProjectsExplorer() {
  const query = useProjects();
  const projects = useMemo(() => query.data ?? [], [query.data]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [location, setLocation] = useState("All");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchesQuery =
        !q || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
      return (
        matchesQuery &&
        (status === "All" || p.status === status) &&
        (type === "All" || p.propertyType === type) &&
        (location === "All" || p.location === location)
      );
    });
  }, [projects, search, status, type, location]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  // Any filter change resets to the first page.
  const reset = (fn: (v: string) => void) => (v: string) => {
    fn(v);
    setPage(1);
  };

  return (
    <section className="bg-background py-20 md:py-28">
      <Container>
        {/* Search bar */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-gold" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by project name or location…"
              className="w-full border-b border-line bg-transparent py-4 pl-8 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-gold"
            />
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center justify-center gap-2 border border-line px-5 py-3 text-[0.75rem] uppercase tracking-[0.18em] text-ink transition-colors hover:border-gold lg:hidden"
          >
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
          {/* Sidebar */}
          <aside className={cn("flex-col gap-10 lg:flex", showFilters ? "flex" : "hidden")}>
            <FilterGroup label="Status" options={PROJECT_STATUSES} value={status} onChange={reset(setStatus)} />
            <FilterGroup label="Type" options={PROJECT_TYPES} value={type} onChange={reset(setType)} />
            <FilterGroup label="Location" options={PROJECT_LOCATIONS} value={location} onChange={reset(setLocation)} />
          </aside>

          {/* Results */}
          <div>
            {query.isPending ? (
              <ResultsSkeleton />
            ) : query.isError ? (
              <ErrorState
                message="We couldn't load the residences right now."
                onRetry={() => void query.refetch()}
              />
            ) : (
              <>
                <p className="mb-6 text-[0.8rem] uppercase tracking-[0.18em] text-muted">
                  {filtered.length} {filtered.length === 1 ? "Residence" : "Residences"}
                </p>

                {visible.length === 0 ? (
                  <div className="border border-line py-24 text-center text-muted">
                    No residences match your selection.
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${status}-${type}-${location}-${search}-${current}`}
                      variants={stagger}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                    >
                      {visible.map((p) => (
                        <motion.div key={p.id} variants={fadeUp}>
                          <ProjectCard project={p} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}

                {pageCount > 1 && (
                  <div className="mt-14 flex items-center justify-center gap-2">
                    {Array.from({ length: pageCount }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={cn(
                          "h-10 w-10 text-sm transition-colors",
                          current === i + 1
                            ? "bg-ink text-white"
                            : "border border-line text-ink hover:border-gold hover:text-gold",
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
