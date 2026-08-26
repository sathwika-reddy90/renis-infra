"use client";

import Link from "next/link";
import Container from "@/components/ui/Container";
import AwardsGrid, { AWARDS } from "@/components/AwardsGrid";

export default function AwardsRecognition() {
  return (
    <section id="awards" className="bg-background py-16 sm:py-20">
      <Container className="text-center">
        <span className="text-[18px] font-medium uppercase tracking-[0.22em] text-[#4a4b4b] [font-family:var(--font-nav),sans-serif]">
          Recognition
        </span>
        <h2 className="mt-3 text-[26px] font-normal uppercase tracking-[0.02em] text-[#bda588] [font-family:var(--font-launch),sans-serif] sm:whitespace-nowrap sm:text-[48px]">
          Awards &amp; Recognition
        </h2>

        <div className="mt-12">
          <AwardsGrid items={AWARDS} />
        </div>

        <Link
          href="/awards"
          className="mt-12 inline-block bg-[#bda588] px-[65px] py-4 text-[14px] font-medium uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:bg-[#a8916f] [font-family:var(--font-nav),sans-serif]"
        >
          View More
        </Link>
      </Container>
    </section>
  );
}
