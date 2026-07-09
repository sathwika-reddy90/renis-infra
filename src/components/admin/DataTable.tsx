"use client";

import { useState, type ReactNode } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";

/* -------------------------------- primitives ------------------------------- */

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-gold"
      />
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
  allLabel,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "cursor-pointer border border-line bg-white px-3 py-2.5 text-[0.72rem] uppercase tracking-[0.12em] text-ink outline-none transition-colors focus:border-gold",
        className,
      )}
    >
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function PaginationBar({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
}) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );
  const items: (number | "…")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) items.push("…");
    items.push(p);
  });

  return (
    <div className="flex items-center gap-1.5">
      <button
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="flex h-8 w-8 items-center justify-center border border-line text-ink transition-colors hover:border-gold disabled:opacity-40"
      >
        <ChevronLeft size={14} />
      </button>
      {items.map((it, i) =>
        it === "…" ? (
          <span key={`e${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <button
            key={it}
            onClick={() => onPage(it)}
            className={cn(
              "h-8 w-8 text-xs transition-colors",
              it === page
                ? "bg-ink text-white"
                : "border border-line text-ink hover:border-gold hover:text-gold",
            )}
          >
            {it}
          </button>
        ),
      )}
      <button
        aria-label="Next page"
        disabled={page === pageCount}
        onClick={() => onPage(page + 1)}
        className="flex h-8 w-8 items-center justify-center border border-line text-ink transition-colors hover:border-gold disabled:opacity-40"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

/* --------------------------------- DataTable ------------------------------- */

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  rows: T[] | undefined;
  loading: boolean;
  error?: boolean;
  onRetry?: () => void;
  columns: Column<T>[];
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  search?: string;
  onSearchChange?: (v: string) => void;
  toolbar?: ReactNode;
  headerActions?: ReactNode;
  actions?: (row: T) => ReactNode;
  pageSize?: number;
  emptyMessage?: string;
}

export default function DataTable<T>({
  rows,
  loading,
  error = false,
  onRetry,
  columns,
  searchText,
  searchPlaceholder,
  search,
  onSearchChange,
  toolbar,
  headerActions,
  actions,
  pageSize = 10,
  emptyMessage = "Nothing here yet.",
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState("");
  const [page, setPage] = useState(1);

  const q = (search ?? internalSearch).trim().toLowerCase();
  const setQ = (v: string) => {
    (onSearchChange ?? setInternalSearch)(v);
    setPage(1);
  };

  const filtered = (rows ?? []).filter((r) => !q || !searchText || searchText(r).toLowerCase().includes(q));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);
  const colSpan = columns.length + (actions ? 1 : 0);

  const showSearch = Boolean(searchText || onSearchChange);

  return (
    <div>
      {(showSearch || toolbar || headerActions) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          {showSearch && (
            <SearchInput
              value={search ?? internalSearch}
              onChange={setQ}
              placeholder={searchPlaceholder}
              className="w-full sm:max-w-xs"
            />
          )}
          {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
          {headerActions && <div className="sm:ml-auto flex items-center gap-2">{headerActions}</div>}
        </div>
      )}

      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line bg-cream/60 text-left text-[0.64rem] uppercase tracking-[0.18em] text-muted">
              {columns.map((c) => (
                <th key={c.key} className={cn("px-4 py-3 font-medium", c.className)}>
                  {c.header}
                </th>
              ))}
              {actions && <th className="w-1 px-4 py-3 text-right font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-line/70">
                  {Array.from({ length: colSpan }).map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={colSpan}>
                  <ErrorState message="We couldn't load this data." onRetry={onRetry} />
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-16 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visible.map((row, i) => (
                <tr key={i} className="border-b border-line/70 transition-colors last:border-0 hover:bg-cream/40">
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                      {c.render(row)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-[0.72rem] uppercase tracking-[0.16em] text-muted">
            {filtered.length} {filtered.length === 1 ? "record" : "records"}
          </p>
          <PaginationBar page={current} pageCount={pageCount} onPage={setPage} />
        </div>
      )}
    </div>
  );
}
