"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSubmitInquiry } from "@/lib/query/hooks";
import type { InquiryInput } from "@/lib/api/contact";

const FIELD =
  "w-full border-b border-line bg-transparent py-3 text-sm text-ink placeholder:text-muted/70 " +
  "outline-none transition-colors focus:border-gold";

// Submits the enquiry to the backend (/api/contact) and shows a confirmation.
export default function ContactForm({
  interests,
  heading,
}: {
  interests?: string[];
  heading?: string;
}) {
  const mutation = useSubmitInquiry();
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload: InquiryInput = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      message: (data.get("message") as string) || undefined,
      interest: (data.get("interest") as string) || undefined,
    };
    mutation.mutate(payload, {
      onSuccess: () => {
        setSent(true);
        form.reset();
      },
    });
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-start gap-4 border border-line bg-cream p-10"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white">
          <Check size={22} />
        </span>
        <h3 className="font-display text-2xl font-light">Thank you.</h3>
        <p className="max-w-sm text-[0.95rem] leading-relaxed text-muted">
          Your enquiry has been received. A residence advisor will be in touch shortly to arrange
          your private viewing.
        </p>
        <button
          onClick={() => {
            setSent(false);
            mutation.reset();
          }}
          className="mt-2 text-[0.78rem] uppercase tracking-[0.2em] text-gold hover:underline"
        >
          Send another enquiry
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {heading && <h3 className="font-display text-3xl font-light">{heading}</h3>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <input required name="name" placeholder="Full Name" className={FIELD} />
        <input required name="phone" type="tel" placeholder="Phone Number" className={FIELD} />
      </div>
      <input required name="email" type="email" placeholder="Email Address" className={FIELD} />
      {interests && (
        <select required name="interest" defaultValue="" className={`${FIELD} cursor-pointer`}>
          <option value="" disabled>
            Interested In
          </option>
          {interests.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      )}
      <textarea name="message" rows={4} placeholder="Your Message" className={`${FIELD} resize-none`} />
      {mutation.isError && (
        <p className="text-[0.85rem] text-red-600">
          Something went wrong. Please try again or call us directly.
        </p>
      )}
      <div className="pt-2">
        <Button variant="gold" className="w-full sm:w-auto">
          {mutation.isPending ? "Submitting…" : "Submit Enquiry"}
        </Button>
      </div>
    </form>
  );
}
