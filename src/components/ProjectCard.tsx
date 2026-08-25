"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/project";

// Reusable project tile with image hover-scale and gold reveal underline.
export default function ProjectCard({
  project,
  priority = false,
  className,
}: {
  project: Project;
  /** Set on above-the-fold cards so the hero image isn't lazy-loaded. */
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link href={project.href} className={cn("group block", className)}>
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={project.featuredImage || "/images/placeholder-project.jpg"}
          alt={project.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[var(--duration-cinematic)] ease-[var(--ease-lux)] group-hover:scale-105"
        />
        <div className="absolute inset-0 scrim-bottom opacity-85 transition-opacity duration-[var(--duration-slow)] group-hover:opacity-100" />

        <span className="absolute left-5 top-5 bg-white/90 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-ink backdrop-blur">
          {project.status}
        </span>

        <span
          aria-hidden
          className="absolute right-5 top-5 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-gold text-white opacity-0 transition-all duration-[var(--duration-slow)] ease-[var(--ease-lux)] group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ArrowUpRight size={18} />
        </span>

        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-gold-soft">
            {project.subtitle}
          </p>
          <h3 className="mt-2 font-display text-h1 font-semibold">{project.title}</h3>
          <p className="mt-1 text-body-sm text-white/75">{project.location}</p>

          {/* Configuration + price — the two facts a buyer scans for first. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.78rem] text-white/85">
            {project.bedrooms && <span>{project.bedrooms}</span>}
            {project.bedrooms && project.priceLabel && (
              <span aria-hidden className="h-3 w-px bg-white/30" />
            )}
            {project.priceLabel && <span className="text-gold-soft">{project.priceLabel}</span>}
          </div>

          <span className="mt-4 block h-px w-0 bg-gold transition-all duration-[var(--duration-slow)] ease-[var(--ease-lux)] group-hover:w-16" />
        </div>
      </div>
    </Link>
  );
}
