import Link from "next/link";
import { FileText } from "lucide-react";
import Section from "@/components/ui/Section";

/**
 * Shared shell for the legal routes.
 *
 * The footer links to these pages, so the routes must exist — but binding
 * legal text is not something to auto-generate. This renders an honest
 * placeholder until the company supplies reviewed copy.
 */
export default function LegalBody({ documentName }: { documentName: string }) {
  return (
    <Section tone="light" rhythm="md">
      <div className="mx-auto max-w-2xl">
        <div className="flex gap-4 border border-line bg-cream p-8">
          <FileText size={20} className="mt-0.5 flex-none text-gold" aria-hidden />
          <div>
            <h2 className="font-display text-h2 font-semibold text-ink">
              This document is being finalised.
            </h2>
            <p className="mt-4 text-body text-muted">
              Our {documentName} is currently with our legal advisors and will be published here
              shortly. In the meantime, if you have any question about how we handle your
              information or about the terms on which this site is offered, please get in touch and
              we will answer directly.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block text-[0.78rem] uppercase tracking-[0.2em] text-gold hover:underline"
            >
              Contact us →
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
