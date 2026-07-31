"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { easeLux } from "@/lib/motion";
import { useSubmitInquiry } from "@/lib/query/hooks";
import type { InquiryInput } from "@/lib/api/contact";

// Submits the enquiry to the backend (/api/contact) and shows a confirmation.
export default function ContactForm({
  interests,
  heading,
  tone = "light",
  /** Pre-selects an interest — used by the project detail enquiry form. */
  defaultInterest,
}: {
  interests?: string[];
  heading?: string;
  tone?: "light" | "invert";
  defaultInterest?: string;
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
        transition={{ duration: 0.6, ease: easeLux }}
        className="flex flex-col items-start gap-4 border border-line bg-cream p-10"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white">
          <Check size={22} aria-hidden />
        </span>
        <h3 className="font-display text-h1 font-light">Thank you.</h3>
        <p className="max-w-sm text-body text-muted">
          Your enquiry has been received. A residence advisor will be in touch shortly to arrange
          your private viewing.
        </p>
        <Button
          variant="link"
          onClick={() => {
            setSent(false);
            mutation.reset();
          }}
        >
          Send another enquiry
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {heading && <h3 className="font-display text-display-3 font-light">{heading}</h3>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input required name="name" placeholder="Full Name" autoComplete="name" tone={tone} />
        <Input
          required
          name="phone"
          type="tel"
          placeholder="Phone Number"
          autoComplete="tel"
          tone={tone}
        />
      </div>

      <Input
        required
        name="email"
        type="email"
        placeholder="Email Address"
        autoComplete="email"
        tone={tone}
      />

      {interests && interests.length > 0 && (
        <Select
          required
          name="interest"
          placeholder="Interested In"
          tone={tone}
          defaultValue={defaultInterest ?? ""}
          options={interests.map((i) => ({ value: i, label: i }))}
        />
      )}

      <Textarea name="message" rows={4} placeholder="Your Message" tone={tone} />

      {mutation.isError && (
        <p role="alert" className="text-body-sm text-red-500">
          Something went wrong. Please try again or call us directly.
        </p>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          variant="gold"
          loading={mutation.isPending}
          className="w-full sm:w-auto"
        >
          {mutation.isPending ? "Submitting…" : "Submit Enquiry"}
        </Button>
      </div>
    </form>
  );
}
