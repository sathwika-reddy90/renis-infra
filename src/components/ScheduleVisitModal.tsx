"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSubmitInquiry } from "@/lib/query/hooks";
import type { InquiryInput } from "@/lib/api/contact";

const FIELD =
  "w-full border-b border-line bg-transparent py-3 text-sm text-ink placeholder:text-muted/70 " +
  "outline-none transition-colors focus:border-gold";

export default function ScheduleVisitModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useSubmitInquiry();
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

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
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-8 md:p-10"
          >
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute right-5 top-5 text-muted transition-colors hover:text-ink"
            >
              <X size={20} />
            </button>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-start gap-4 py-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white">
                  <Check size={22} />
                </span>
                <h3 className="font-display text-2xl font-light">Visit requested.</h3>
                <p className="max-w-sm text-[0.95rem] leading-relaxed text-muted">
                  A residence advisor will confirm your preferred slot shortly.
                </p>
                <Button variant="ghost" onClick={handleClose}>
                  Close
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <span className="eyebrow">Private Viewing</span>
                  <h3 className="mt-2 font-display text-3xl font-light">Schedule a Visit</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <input required name="name" placeholder="Full Name" className={FIELD} />
                  <input required name="phone" type="tel" placeholder="Phone Number" className={FIELD} />
                </div>
                <input required name="email" type="email" placeholder="Email Address" className={FIELD} />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[0.68rem] uppercase tracking-[0.18em] text-muted">
                      Preferred Date
                    </span>
                    <input name="visitDate" type="date" className={FIELD} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[0.68rem] uppercase tracking-[0.18em] text-muted">
                      Preferred Time
                    </span>
                    <input name="visitTime" type="time" className={FIELD} />
                  </label>
                </div>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Anything specific you'd like to see?"
                  className={`${FIELD} resize-none`}
                />
                {mutation.isError && (
                  <p className="text-[0.85rem] text-red-600">
                    Something went wrong. Please try again or call us directly.
                  </p>
                )}
                <Button variant="gold" className="w-full sm:w-auto">
                  {mutation.isPending ? "Submitting…" : "Request Visit"}
                </Button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
