"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { Input, Textarea } from "@/components/ui/Field";
import { useSubmitInquiry } from "@/lib/query/hooks";
import type { InquiryInput } from "@/lib/api/contact";

export default function ScheduleVisitModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useSubmitInquiry();
  const [sent, setSent] = useState(false);

  function handleClose() {
    onClose();
    // Reset after the close animation so returning users see a fresh form.
    setTimeout(() => {
      setSent(false);
      mutation.reset();
    }, 300);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload: InquiryInput = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      message: (data.get("message") as string) || undefined,
      visitDate: (data.get("visitDate") as string) || undefined,
      visitTime: (data.get("visitTime") as string) || undefined,
    };
    mutation.mutate(payload, {
      onSuccess: () => {
        setSent(true);
        form.reset();
      },
    });
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={sent ? "Visit requested." : "Schedule a Visit"}
      hideTitle
    >
      {sent ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-start gap-4 py-4"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white">
            <Check size={22} aria-hidden />
          </span>
          <h3 className="font-display text-display-3 font-light">Visit requested.</h3>
          <p className="max-w-sm text-body text-muted">
            A residence advisor will confirm your preferred slot shortly.
          </p>
          <Button variant="ghost" onClick={handleClose}>
            Close
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <div>
            <span className="eyebrow">Private Viewing</span>
            <h3 className="mt-2 font-display text-display-3 font-light">Schedule a Visit</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input required name="name" placeholder="Full Name" autoComplete="name" />
            <Input required name="phone" type="tel" placeholder="Phone Number" autoComplete="tel" />
          </div>

          <Input required name="email" type="email" placeholder="Email Address" autoComplete="email" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input name="visitDate" type="date" label="Preferred Date" />
            <Input name="visitTime" type="time" label="Preferred Time" />
          </div>

          <Textarea
            name="message"
            rows={3}
            placeholder="Anything specific you'd like to see?"
          />

          {mutation.isError && (
            <p role="alert" className="text-body-sm text-red-500">
              Something went wrong. Please try again or call us directly.
            </p>
          )}

          <Button
            type="submit"
            variant="gold"
            loading={mutation.isPending}
            className="w-full sm:w-auto"
          >
            {mutation.isPending ? "Submitting…" : "Request Visit"}
          </Button>
        </form>
      )}
    </Dialog>
  );
}
