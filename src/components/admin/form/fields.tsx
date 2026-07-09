"use client";

import { useState, type ComponentPropsWithRef, type ReactNode } from "react";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { X, Plus, ArrowUp, ArrowDown, ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export const INPUT_CLASS =
  "w-full border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-gold";

/* --------------------------------- shells ---------------------------------- */

export function FieldShell({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted/80">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <h3 className="font-display text-lg font-light">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

/* ------------------------------ register fields ---------------------------- */

type TextFieldProps = ComponentPropsWithRef<"input"> & { label: string; error?: string; hint?: string };

export function TextField({ label, error, hint, className, ...rest }: TextFieldProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={className}>
      <input className={INPUT_CLASS} {...rest} />
    </FieldShell>
  );
}

type TextareaFieldProps = ComponentPropsWithRef<"textarea"> & { label: string; error?: string; hint?: string };

export function TextareaField({ label, error, hint, rows = 4, className, ...rest }: TextareaFieldProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={className}>
      <textarea rows={rows} className={cn(INPUT_CLASS, "resize-y")} {...rest} />
    </FieldShell>
  );
}

type SelectFieldProps = ComponentPropsWithRef<"select"> & {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function SelectField({ label, error, options, placeholder, className, ...rest }: SelectFieldProps) {
  return (
    <FieldShell label={label} error={error} className={className}>
      <select className={cn(INPUT_CLASS, "cursor-pointer")} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

type CheckFieldProps = ComponentPropsWithRef<"input"> & { label: string };

export function CheckField({ label, className, ...rest }: CheckFieldProps) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2.5 py-1", className)}>
      <input type="checkbox" className="h-4 w-4 cursor-pointer accent-[#c8a45d]" {...rest} />
      <span className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ink">{label}</span>
    </label>
  );
}

/* ----------------------------- controlled fields --------------------------- */

export function TagsField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Type and press Enter",
  hint,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  hint?: string;
}) {
  const { field, fieldState } = useController({ control, name });
  const value: string[] = Array.isArray(field.value) ? field.value : [];
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (!value.includes(v)) field.onChange([...value, v]);
    setDraft("");
  };

  return (
    <FieldShell label={label} error={fieldState.error?.message} hint={hint}>
      <div className="flex flex-wrap items-center gap-1.5 border border-line bg-white px-2 py-1.5 transition-colors focus-within:border-gold">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-cream px-2 py-1 text-xs text-ink"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => field.onChange(value.filter((t) => t !== tag))}
              className="text-muted hover:text-red-600"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-28 flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted/60"
        />
      </div>
    </FieldShell>
  );
}

/* Image "uploader": URL-based with live preview (the backend stores image
   URLs; direct file upload needs a storage service + endpoint). */

function Preview({ src }: { src: string }) {
  return (
    <div className="flex h-20 w-28 flex-none items-center justify-center overflow-hidden border border-line bg-cream">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Preview" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <ImageIcon size={20} className="text-muted/50" />
      )}
    </div>
  );
}

export function ImageField<T extends FieldValues>({
  control,
  name,
  label,
  hint = "Paste an image URL",
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  hint?: string;
}) {
  const { field, fieldState } = useController({ control, name });
  const value: string = typeof field.value === "string" ? field.value : "";

  return (
    <FieldShell label={label} error={fieldState.error?.message} hint={hint}>
      <div className="flex items-start gap-3">
        <Preview src={value} />
        <input
          value={value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          placeholder="https://…"
          className={INPUT_CLASS}
        />
      </div>
    </FieldShell>
  );
}

export function ImageListField<T extends FieldValues>({
  control,
  name,
  label,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
}) {
  const { field, fieldState } = useController({ control, name });
  const value: string[] = Array.isArray(field.value) ? field.value : [];
  const [draft, setDraft] = useState("");

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    field.onChange(next);
  };

  return (
    <FieldShell label={label} error={fieldState.error?.message}>
      <div className="space-y-2">
        {value.map((src, i) => (
          <div key={`${src}-${i}`} className="flex items-center gap-2 border border-line bg-white p-2">
            <Preview src={src} />
            <p className="min-w-0 flex-1 truncate text-xs text-muted">{src}</p>
            <div className="flex flex-none gap-1">
              <button type="button" aria-label="Move up" onClick={() => move(i, -1)} className="p-1 text-muted hover:text-gold">
                <ArrowUp size={14} />
              </button>
              <button type="button" aria-label="Move down" onClick={() => move(i, 1)} className="p-1 text-muted hover:text-gold">
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => field.onChange(value.filter((_, k) => k !== i))}
                className="p-1 text-muted hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="https://… (image URL)"
            className={INPUT_CLASS}
          />
          <button
            type="button"
            onClick={() => {
              const v = draft.trim();
              if (!v) return;
              field.onChange([...value, v]);
              setDraft("");
            }}
            className="flex-none border border-line px-3 text-muted transition-colors hover:border-gold hover:text-gold"
            aria-label="Add image"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </FieldShell>
  );
}

/* --------------------------- field-array item shell ------------------------- */

export function ArrayItem({
  index,
  onRemove,
  children,
}: {
  index: number;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="relative border border-line bg-cream/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[0.62rem] uppercase tracking-[0.2em] text-gold">#{index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove item"
          className="text-muted transition-colors hover:text-red-600"
        >
          <X size={14} />
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function AddItemButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 border border-dashed border-line py-2.5 text-[0.68rem] uppercase tracking-[0.16em] text-muted transition-colors hover:border-gold hover:text-gold"
    >
      <Plus size={14} /> {label}
    </button>
  );
}
