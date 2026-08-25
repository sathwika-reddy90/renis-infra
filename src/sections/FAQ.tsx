"use client";

import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Accordion from "@/components/ui/Accordion";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useFaqs } from "@/lib/query/hooks";

function FaqSkeleton() {
  return (
    <div className="mx-auto mt-14 max-w-3xl space-y-4">
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
      <SectionHeading
        eyebrow="Questions, Answered"
        title={
          <>
            Frequently Asked <span className="italic text-gold">Questions</span>
          </>
        }
        description="Everything you need to know before beginning your journey with RENIESINFRA."
      />

      <QueryView
        query={query}
        skeleton={<FaqSkeleton />}
        errorMessage="Unable to load FAQs right now."
      >
        {(faqs) =>
          faqs.length === 0 ? null : (
            <Reveal delay={0.1} className="mx-auto mt-14 max-w-3xl">
              {/* Shares the accessible disclosure component with project pages
                  rather than duplicating it. */}
              <Accordion items={faqs} variant="circle" defaultOpen={null} />
            </Reveal>
          )
        }
      </QueryView>
    </Section>
  );
}
