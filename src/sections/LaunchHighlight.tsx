"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Skeleton from "@/components/ui/Skeleton";
import { useScheduleVisit } from "@/components/ScheduleVisitContext";
import { useSiteContent } from "@/lib/query/hooks";

/** Latest-launch band. Copy is CMS-managed via /admin/content → Launch. */
export default function LaunchHighlight() {
  const { openVisitModal } = useScheduleVisit();
  const { data, isPending } = useSiteContent();
  const launch = data?.launch;

  if (isPending) {
    return (
      <Section tone="transparent" rhythm="md">
        <div className="mx-auto max-w-2xl space-y-5 text-center">
          <Skeleton className="mx-auto h-4 w-32" />
          <Skeleton className="mx-auto h-12 w-2/3" />
          <Skeleton className="mx-auto h-4 w-1/2" />
        </div>
      </Section>
    );
  }

  if (!launch) return null;

  return (
    <Section
      id="launch-highlight"
      tone="transparent"
      rhythm="none"
      className="py-24"
      containerClassName="text-center"
    >
      <Reveal>
        <span className="block text-[18px] font-medium uppercase tracking-[2.88px] text-[#4a4b4b] [font-family:var(--font-nav),sans-serif]">
          {launch.eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mx-auto mt-7 text-[48px] font-normal uppercase leading-[1.25] tracking-[4.8px] text-[#bda588] [font-family:var(--font-launch),sans-serif] max-md:text-[32px] max-md:tracking-[3px]">
          Sattva Lago by Reniesinfra
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-5 [font-family:var(--font-nav),sans-serif]">
          <Link
            href={launch.discoverHref}
            className="inline-flex h-[59px] min-w-[233px] max-[360px]:w-full max-[360px]:min-w-0 items-center justify-center gap-2.5 rounded-none bg-[#555555] px-8 text-[14px] font-medium uppercase tracking-[1.4px] text-white transition-colors duration-[var(--duration-base)] hover:bg-[#444444]"
          >
            <ExternalLink size={16} aria-hidden />
            Discover
          </Link>
          <button
            type="button"
            onClick={openVisitModal}
            className="inline-flex h-[59px] min-w-[294px] max-[360px]:w-full max-[360px]:min-w-0 cursor-pointer items-center justify-center rounded-none border border-[#bda588] bg-[#bda588] px-8 text-[14px] font-medium uppercase tracking-[1.4px] text-white transition-colors duration-[var(--duration-base)] hover:bg-[#ac9376]"
          >
            Register Interest
          </button>
        </div>
      </Reveal>
    </Section>
  );
}
