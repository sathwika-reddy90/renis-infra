"use client";

import { useState } from "react";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { ArrowUp, ArrowDown, ImageIcon, UploadCloud, X } from "lucide-react";
import Modal from "@/components/admin/Modal";
import MediaLibrary from "@/components/admin/media/MediaLibrary";
import { FieldShell } from "@/components/admin/form/fields";
import type { AdminMedia } from "@/lib/admin/types";

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

/** Single-image field backed by the Media Library instead of a raw URL paste. */
export function MediaPickerField<T extends FieldValues>({
  control,
  name,
  label,
  hint = "Choose from the media library",
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  hint?: string;
}) {
  const { field, fieldState } = useController({ control, name });
  const value: string = typeof field.value === "string" ? field.value : "";
  const [open, setOpen] = useState(false);

  return (
    <FieldShell label={label} error={fieldState.error?.message} hint={hint}>
      <div className="flex items-start gap-3">
        <Preview src={value} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 border border-dashed border-line px-3 py-2.5 text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:border-gold hover:text-gold"
        >
          <UploadCloud size={14} /> {value ? "Change image" : "Select image"}
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Media Library" size="lg">
        <MediaLibrary
          selectable
          onSelect={(item: AdminMedia) => {
            field.onChange(item.url);
            setOpen(false);
          }}
        />
      </Modal>
    </FieldShell>
  );
}

/** Multi-image field (ordered array of URLs) backed by the Media Library. */
export function MediaPickerListField<T extends FieldValues>({
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
  const [open, setOpen] = useState(false);

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
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 border border-dashed border-line py-2.5 text-[0.68rem] uppercase tracking-[0.16em] text-muted transition-colors hover:border-gold hover:text-gold"
        >
          <UploadCloud size={14} /> Add from media library
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Media Library" size="lg">
        <MediaLibrary
          selectable
          multiple
          onSelectMany={(items: AdminMedia[]) => {
            // Skip anything already in the list so re-opening the picker
            // can't duplicate an image.
            const additions = items.map((i) => i.url).filter((url) => !value.includes(url));
            if (additions.length > 0) field.onChange([...value, ...additions]);
            setOpen(false);
          }}
        />
      </Modal>
    </FieldShell>
  );
}
