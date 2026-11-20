"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import Container from "@/components/ui/Container";
import ProjectCard from "@/components/ProjectCard";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { easeLux } from "@/lib/motion";
import { useProjects } from "@/lib/query/hooks";
import {
  PROJECT_CATEGORY_GROUPS,
  categoryHref,
  categoryTitle,
  findProjectCategory,
  projectsInCategory,
} from "@/config/projectCategories";

/** Sidebar entry, styled to match the projects explorer's filter options. */
function CategoryLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex w-full items-center gap-2 py-1.5 text-left text-body-sm transition-colors",
        active ? "text-gold" : "text-muted hover:text-ink",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-px bg-gold transition-all duration-[var(--duration-base)] ease-[var(--ease-lux)]",
          active ? "w-5" : "w-0 group-hover:w-3",
        )}
      />
      {children}
    </Link>
  );
}

/**
 * One category's projects, with every other category a click away. Reads the
 * shared project list (already prefetched by the site layout) and filters it
 * by the slugs curated in config/projectCategories.ts.
 */
export default function ProjectCategoryListing({ categorySlug }: { categorySlug: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const projects = useProjects();
  const match = findProjectCategory(categorySlug);
  if (!match) return null;

  const { group, category } = match;
  const items = projectsInCategory(category, projects.data ?? []);

  return (
    <section className="bg-background py-section">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
          {/* Category navigation */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="category-nav"
              className="flex w-full cursor-pointer items-center justify-between border border-line px-4 py-3 text-[0.72rem] uppercase tracking-[0.2em] text-ink lg:hidden"
            >
              <span className="inline-flex items-center gap-2">
                <LayoutGrid size={14} aria-hidden /> Categories
              </span>
              <span className="truncate pl-4 text-gold">{category.label}</span>
            </button>

            <nav
              id="category-nav"
              aria-label="Project categories"
              className={cn("mt-6 space-y-6 lg:mt-0 lg:block", menuOpen ? "block" : "hidden")}
            >
              {PROJECT_CATEGORY_GROUPS.map((g) => (
                <div key={g.id} className="border-b border-line pb-6">
                  <h2 className="text-[0.68rem] uppercase tracking-[0.24em] text-ink">{g.label}</h2>
                  <ul className="mt-4 space-y-1">
                    {g.categories.map((c) => (
                      <li key={c.slug}>
                        <CategoryLink href={categoryHref(c.slug)} active={c.slug === category.slug}>
                          {c.label}
                        </CategoryLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-gold hover:underline"
              >
                View all projects →
              </Link>
            </nav>
          </aside>

          {/* Results */}
          <div>
            <div className="flex flex-col gap-2 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-gold">{group.label}</p>
                <h2 className="mt-2 font-display text-h2 font-semibold text-ink">
                  {category.label}
                </h2>
              </div>
              <p className="whitespace-nowrap text-[0.72rem] uppercase tracking-[0.18em] text-muted">
                {projects.isPending
                  ? "…"
                  : `${items.length} ${items.length === 1 ? "Project" : "Projects"}`}
              </p>
            </div>

            {projects.isError && !projects.data ? (
              <div className="mt-10">
                <ErrorState
                  message="We couldn't load our projects."
                  onRetry={() => void projects.refetch()}
                />
              </div>
            ) : projects.isPending ? (
              <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5]" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="mt-16 text-center">
                <p className="font-display text-h2 font-semibold text-ink">
                  No listings in this category yet.
                </p>
                <p className="mx-auto mt-3 max-w-md text-body text-muted">
                  We&apos;re preparing {categoryTitle(group, category)}. Speak with an advisor
                  about current availability, or explore our full portfolio.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button href="/projects" variant="ghost">
                    View All Projects
                  </Button>
                  <Button href="/contact" variant="gold">
                    Talk to an Advisor
                  </Button>
                </div>
              </div>
            ) : (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: easeLux }}
                className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3"
              >
                {items.map((project, i) => (
                  <ProjectCard key={project.id} project={project} priority={i < 3} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
