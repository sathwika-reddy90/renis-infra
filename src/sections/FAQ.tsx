"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import QueryView from "@/components/ui/QueryView";
import Skeleton from "@/components/ui/Skeleton";
import { useFaqs } from "@/lib/query/hooks";
import type { FAQ as FaqItem } from "@/types/faq";

function FaqSkeleton() {
  return (
    <div className="mx-auto mt-14 max-w-3xl space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function AccordionItem({
  faq,
  open,
  onToggle,
}: {
  faq: FaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-line">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span className="font-display text-lg font-light text-ink md:text-xl">
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-line text-gold"
        >
          <Plus size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 max-w-2xl text-[0.95rem] leading-relaxed text-muted">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const query = useFaqs();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="faq" className="bg-background py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Questions, Answered"
          title={
            <>
              Frequently Asked <span className="italic text-gold">Questions</span>
            </>
          }
          description="Everything you need to know before beginning your journey with RENISINFRA."
        />

        <QueryView query={query} skeleton={<FaqSkeleton />} errorMessage="Unable to load FAQs right now.">
          {(faqs) => (
            <Reveal delay={0.1} className="mx-auto mt-14 max-w-3xl">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  faq={faq}
                  open={openId === faq.id}
                  onToggle={() => setOpenId((id) => (id === faq.id ? null : faq.id))}
                />
              ))}
            </Reveal>
          )}
        </QueryView>
      </Container>
    </section>
  );
}
