"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Container from "@/components/ui/Container";
import ProjectCard from "@/components/ProjectCard";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { scrollToTop } from "@/lib/lenis";
import { easeLux } from "@/lib/motion";
import { useProjectFacets, useProjectPage } from "@/lib/query/hooks";
import type { PropertyStatus, PropertyType } from "@/types/property";

const PER_PAGE = 9;

type SortValue = "curated" | "newest" | "priceAsc" | "priceDesc";

const SORTS: { value: SortValue; label: string }[] = [
  { value: "curated", label: "Curated" },
  { value: "newest", label: "Newest" },
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
];

function FilterOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex w-full items-center gap-2 py-1.5 text-left text-body-sm transition-colors",
        active ? "text-gold" : "text-muted hover:text-ink",
      )}
    >
      <span
        className={cn(
          "h-px bg-gold transition-all duration-[var(--duration-base)] ease-[var(--ease-lux)]",
          active ? "w-5" : "w-0 group-hover:w-3",
        )}
      />
      {children}
    </button>
  );
}

/** A filter column. Options come from live data, so nothing is unreachable. */
function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T | null) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div className="border-b border-line pb-6">
      <h3 className="text-[0.68rem] uppercase tracking-[0.24em] text-ink">{label}</h3>
      <ul className="mt-4 space-y-1">
        <li>
          <FilterOption active={value === null} onClick={() => onChange(null)}>
            All
          </FilterOption>
        </li>
        {options.map((option) => (
          <li key={option}>
            <FilterOption active={value === option} onClick={() => onChange(option)}>
              {option}
            </FilterOption>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProjectsExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // The URL is the source of truth, so a filtered view is shareable and
  // survives back/forward navigation.
  const status = (params.get("status") as PropertyStatus | null) ?? null;
  const propertyType = (params.get("type") as PropertyType | null) ?? null;
  const location = params.get("location");
  const sort = (params.get("sort") as SortValue | null) ?? "curated";
  const page = Number(params.get("page")) || 1;
  const urlSearch = params.get("q") ?? "";

  const [searchDraft, setSearchDraft] = useState(urlSearch);
  const [trackedQuery, setTrackedQuery] = useState(urlSearch);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Re-sync the input when the URL changes from outside the component (back
  // button, a shared link). Adjusting during render rather than in an effect
  // avoids a second render pass on every keystroke.
  if (trackedQuery !== urlSearch) {
    setTrackedQuery(urlSearch);
    setSearchDraft(urlSearch);
  }

  const setParams = useCallback(
    (next: Record<string, string | null>) => {
      const merged = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value === null || value === "") merged.delete(key);
        else merged.set(key, value);
      }
      // Any filter change resets paging — page 4 of the old result set is
      // meaningless against a new one.
      if (!("page" in next)) merged.delete("page");
      const qs = merged.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  // Debounce the search box so each keystroke isn't a request.
  useEffect(() => {
    if (searchDraft === urlSearch) return;
    const timer = setTimeout(() => setParams({ q: searchDraft || null }), 350);
    return () => clearTimeout(timer);
  }, [searchDraft, urlSearch, setParams]);

  const facets = useProjectFacets();

  const query = useMemo(
    () => ({
      page,
      limit: PER_PAGE,
      sort,
      ...(status ? { status } : {}),
      ...(propertyType ? { propertyType } : {}),
      ...(location ? { location } : {}),
      ...(urlSearch ? { search: urlSearch } : {}),
    }),
    [page, sort, status, propertyType, location, urlSearch],
  );

  const results = useProjectPage(query);

  const activeCount = [status, propertyType, location, urlSearch || null].filter(Boolean).length;
  const total = results.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const clearAll = () => setParams({ status: null, type: null, location: null, q: null });

  return (
    <section className="bg-background py-section">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
          {/* Filters */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              className="flex w-full items-center justify-between border border-line px-4 py-3 text-[0.72rem] uppercase tracking-[0.2em] text-ink lg:hidden"
            >
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal size={14} aria-hidden /> Filters
              </span>
              {activeCount > 0 && <span className="text-gold">{activeCount}</span>}
            </button>

            <div className={cn("mt-6 space-y-6 lg:mt-0 lg:block", filtersOpen ? "block" : "hidden")}>
              <FilterGroup
                label="Status"
                options={facets.data?.statuses ?? []}
                value={status}
                onChange={(v) => setParams({ status: v })}
              />
              <FilterGroup
                label="Type"
                options={facets.data?.propertyTypes ?? []}
                value={propertyType}
                onChange={(v) => setParams({ type: v })}
              />
              <FilterGroup
                label="Location"
                options={facets.data?.locations ?? []}
                value={location}
                onChange={(v) => setParams({ location: v })}
              />
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-gold hover:underline"
                >
                  <X size={13} aria-hidden /> Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative flex-1 sm:max-w-xs">
                <span className="sr-only">Search projects</span>
                <Search
                  size={15}
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  placeholder="Search by name or location"
                  className="w-full border-b border-line bg-transparent py-2.5 pl-6 text-body-sm outline-none transition-colors placeholder:text-muted/70 focus:border-gold"
                />
              </label>

              <div className="flex items-center gap-5">
                <p className="whitespace-nowrap text-[0.72rem] uppercase tracking-[0.18em] text-muted">
                  {results.isPending ? "…" : `${total} ${total === 1 ? "Residence" : "Residences"}`}
                </p>
                <label>
                  <span className="sr-only">Sort by</span>
                  <select
                    value={sort}
                    onChange={(e) => setParams({ sort: e.target.value })}
                    className="cursor-pointer border-b border-line bg-transparent py-2 text-[0.72rem] uppercase tracking-[0.16em] text-ink outline-none focus:border-gold"
                  >
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {results.isError ? (
              <div className="mt-10">
                <ErrorState
                  message="We couldn't load our projects."
                  onRetry={() => void results.refetch()}
                />
              </div>
            ) : results.isPending ? (
              <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5]" />
                ))}
              </div>
            ) : total === 0 ? (
              <div className="mt-16 text-center">
                <p className="font-display text-h2 font-light text-ink">No matching residences.</p>
                <p className="mx-auto mt-3 max-w-sm text-body text-muted">
                  Try widening your filters, or speak with an advisor and we&apos;ll curate a
                  shortlist for you.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button variant="ghost" onClick={clearAll}>
                    Clear Filters
                  </Button>
                  <Button href="/contact" variant="gold">
                    Talk to an Advisor
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${status}-${propertyType}-${location}-${urlSearch}-${sort}-${page}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease: easeLux }}
                    className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3"
                  >
                    {results.data.items.map((project, i) => (
                      <ProjectCard key={project.id} project={project} priority={i < 3} />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {pageCount > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="mt-14 flex items-center justify-center gap-2"
                  >
                    {Array.from({ length: pageCount }).map((_, i) => {
                      const n = i + 1;
                      const active = n === page;
                      return (
                        <button
                          key={n}
                          type="button"
                          aria-current={active ? "page" : undefined}
                          onClick={() => {
                            setParams({ page: String(n) });
                            scrollToTop();
                          }}
                          className={cn(
                            "h-10 w-10 text-[0.78rem] transition-colors",
                            active
                              ? "bg-ink text-white"
                              : "border border-line text-muted hover:border-gold hover:text-gold",
                          )}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
