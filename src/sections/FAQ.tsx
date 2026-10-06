"use client";

import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Accordion from "@/components/ui/Accordion";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useFaqs } from "@/lib/query/hooks";

function FaqSkeleton() {
  return (
    <div className="mt-14 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export default function FAQ() {
  const query = useFaqs();

  return (
    <Section id="faq" tone="light" rhythm="md">
      <div className="text-center">
        <h2 className="text-[26px] font-normal uppercase tracking-[0.02em] text-[#bda588] [font-family:var(--font-launch),sans-serif] sm:text-[48px] lg:whitespace-nowrap">
          Frequently Asked Questions
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] text-foreground [font-family:var(--font-nav),sans-serif] sm:max-w-none lg:whitespace-nowrap">
          Everything you need to know before beginning your journey with RENIESINFRA.
        </p>
      </div>

      <QueryView
        query={query}
        skeleton={<FaqSkeleton />}
        errorMessage="Unable to load FAQs right now."
      >
        {(faqs) =>
          faqs.length === 0 ? null : (
            <Reveal delay={0.1} className="py-[50px]">
              {/* Shares the accessible disclosure component with project pages
                  rather than duplicating it. */}
              <Accordion items={faqs} variant="circle" defaultOpen={null} compact />
            </Reveal>
          )
        }
      </QueryView>
    </Section>
  );
}
