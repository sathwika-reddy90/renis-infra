"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types/project";

// Reusable project tile with image hover-scale and gold reveal underline.
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <a href={project.href} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={project.featuredImage || "/images/placeholder-project.jpg"}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-[1.1s] ease-[var(--ease-lux)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

        <span className="absolute left-5 top-5 bg-white/90 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-ink backdrop-blur">
          {project.status}
        </span>

        <span className="absolute right-5 top-5 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-gold text-white opacity-0 transition-all duration-500 ease-[var(--ease-lux)] group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={18} />
        </span>

        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-gold-soft">
            {project.subtitle}
          </p>
          <h3 className="mt-2 font-display text-3xl font-light">{project.title}</h3>
          <p className="mt-1 text-sm text-white/75">{project.location}</p>
          <span className="mt-4 block h-px w-0 bg-gold transition-all duration-500 ease-[var(--ease-lux)] group-hover:w-16" />
        </div>
      </div>
    </a>
  );
}
