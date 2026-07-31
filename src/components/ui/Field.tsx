"use client";

import { useId, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Public-site form fields. Previously the input styling was a `FIELD` string
 * copy-pasted between ContactForm and ScheduleVisitModal; it lives here now.
 *
 * `tone="invert"` is for fields sitting on the ink/dark sections.
 */
type Tone = "light" | "invert";

const control = (tone: Tone, hasError: boolean) =>
  cn(
    "w-full border-b bg-transparent py-3 text-body-sm outline-none",
    "transition-colors duration-[var(--duration-base)]",
    tone === "light"
      ? "border-line text-ink placeholder:text-muted/70 focus:border-gold"
      : "border-white/25 text-white placeholder:text-white/50 focus:border-gold",
    hasError && "border-red-500 focus:border-red-500",
  );

const labelClass = (tone: Tone) =>
  cn(
    "text-[0.7rem] uppercase tracking-[0.22em]",
    tone === "light" ? "text-muted" : "text-white/60",
  );

interface Common {
  label?: string;
  error?: string;
  hint?: string;
  tone?: Tone;
  className?: string;
}

function Shell({
  id,
  label,
  error,
  hint,
  tone = "light",
  className,
  children,
}: Common & { id: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label htmlFor={id} className={labelClass(tone)}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[0.78rem] text-red-500">
          {error}
        </p>
      ) : (
        hint && (
          <p className={cn("text-[0.78rem]", tone === "light" ? "text-muted" : "text-white/50")}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/* ---------------------------------- Input --------------------------------- */

export type InputProps = Common & React.ComponentPropsWithoutRef<"input">;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, tone = "light", className, ...props },
  ref,
) {
  const auto = useId();
  const id = props.id ?? auto;
  return (
    <Shell id={id} label={label} error={error} hint={hint} tone={tone} className={className}>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={control(tone, Boolean(error))}
        {...props}
      />
    </Shell>
  );
});

/* -------------------------------- Textarea -------------------------------- */

export type TextareaProps = Common & React.ComponentPropsWithoutRef<"textarea">;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, tone = "light", className, rows = 4, ...props },
  ref,
) {
  const auto = useId();
  const id = props.id ?? auto;
  return (
    <Shell id={id} label={label} error={error} hint={hint} tone={tone} className={className}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(control(tone, Boolean(error)), "resize-none")}
        {...props}
      />
    </Shell>
  );
});

/* --------------------------------- Select --------------------------------- */

export type SelectProps = Common & {
  options: { value: string; label: string }[];
  placeholder?: string;
} & React.ComponentPropsWithoutRef<"select">;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, tone = "light", className, options, placeholder, ...props },
  ref,
) {
  const auto = useId();
  const id = props.id ?? auto;
  return (
    <Shell id={id} label={label} error={error} hint={hint} tone={tone} className={className}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            control(tone, Boolean(error)),
            "cursor-pointer appearance-none pr-8",
            // Native option lists render on the OS surface, so they need a
            // readable colour even when the control itself is inverted.
            "[&>option]:bg-white [&>option]:text-ink",
          )}
          defaultValue={props.defaultValue ?? (placeholder ? "" : undefined)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-1 top-1/2 -translate-y-1/2",
            tone === "light" ? "text-muted" : "text-white/50",
          )}
        />
      </div>
    </Shell>
  );
});
