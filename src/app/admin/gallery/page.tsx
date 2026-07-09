"use client";

import { useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye } from "lucide-react";
import Lightbox from "@/components/ui/Lightbox";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import EntityFormDrawer from "@/components/admin/EntityFormDrawer";
import { ConfirmDialog } from "@/components/admin/Modal";
import { AdminButton, IconButton, Badge } from "@/components/admin/ui";
import { TextField, SelectField, FieldGrid } from "@/components/admin/form/fields";
import { MediaPickerField } from "@/components/admin/form/MediaPickerField";
import { zodResolver } from "@/lib/admin/resolver";
import { adminApi } from "@/lib/admin/api";
import { useAdminList, useCrudMutations } from "@/lib/admin/hooks";
import { gallerySchema, type GalleryInput } from "@/lib/admin/schemas";
import { GALLERY_CATEGORIES, type AdminGalleryImage } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

function Fields({ form }: { form: UseFormReturn<GalleryInput> }) {
  const { register, control, formState: { errors } } = form;
  return (
    <>
      <MediaPickerField control={control} name="src" label="Image" />
      <TextField label="Alt text" error={errors.alt?.message} {...register("alt")} />
      <FieldGrid>
        <SelectField
          label="Category"
          placeholder="Pick a category"
          options={GALLERY_CATEGORIES.map((c) => ({ value: c, label: c }))}
          error={errors.category?.message}
          {...register("category")}
        />
        <TextField label="Order" type="number" min={0} error={errors.order?.message} {...register("order")} />
      </FieldGrid>
    </>
  );
}

export default function GalleryAdminPage() {
  const list = useAdminList("gallery", adminApi.gallery);
  const { create, update, remove } = useCrudMutations("gallery", adminApi.gallery, "Image");

  const [category, setCategory] = useState<string>("All");
  const [drawer, setDrawer] = useState<{ row: AdminGalleryImage | null } | null>(null);
  const [toDelete, setToDelete] = useState<AdminGalleryImage | null>(null);
  const [preview, setPreview] = useState<number | null>(null);

  const form = useForm<GalleryInput>({
    resolver: zodResolver<GalleryInput>(gallerySchema),
    defaultValues: { src: "", alt: "", category: "INTERIORS", order: 0 },
  });

  const sorted = useMemo(
    () =>
      [...(list.data ?? [])]
        .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt))
        .filter((g) => category === "All" || g.category === category),
    [list.data, category],
  );

  const openCreate = () => {
    form.reset({ src: "", alt: "", category: "INTERIORS", order: list.data?.length ?? 0 });
    setDrawer({ row: null });
  };

  const openEdit = (row: AdminGalleryImage) => {
    form.reset({ src: row.src, alt: row.alt, category: row.category, order: row.order });
    setDrawer({ row });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (drawer?.row) await update.mutateAsync({ id: drawer.row.id, data: values });
      else await create.mutateAsync(values);
      setDrawer(null);
    } catch {
      /* toast handled by mutation */
    }
  });

  // Reorder: swap the `order` of two adjacent images (normalized to indexes).
  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= sorted.length) return;
    update.mutate({ id: sorted[index].id, data: { order: j } });
    update.mutate({ id: sorted[j].id, data: { order: index } });
  };

  return (
    <div>
      {/* Category chips + actions */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {["All", ...GALLERY_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "px-4 py-2 text-[0.66rem] uppercase tracking-[0.16em] transition-colors duration-300",
              category === c
                ? "bg-ink text-white"
                : "border border-line bg-white text-muted hover:border-gold hover:text-ink",
            )}
          >
            {c}
          </button>
        ))}
        <div className="ml-auto">
          <AdminButton onClick={openCreate}>
            <Plus size={14} /> Add Image
          </AdminButton>
        </div>
      </div>

      {/* Grid */}
      {list.isPending ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full" />
          ))}
        </div>
      ) : list.isError ? (
        <ErrorState message="We couldn't load the gallery." onRetry={() => void list.refetch()} />
      ) : sorted.length === 0 ? (
        <div className="border border-line bg-white py-20 text-center text-muted">
          No images in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {sorted.map((img, i) => (
            <div key={img.id} className="group border border-line bg-white">
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-105"
                />
                <button
                  aria-label="Preview image"
                  onClick={() => setPreview(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 hover:bg-black/35 group-hover:opacity-100"
                >
                  <Eye size={22} className="text-white" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-ink">{img.alt}</p>
                  <Badge tone="gold">{img.category}</Badge>
                </div>
                <IconButton title="Move earlier" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp size={13} />
                </IconButton>
                <IconButton title="Move later" onClick={() => move(i, 1)} disabled={i === sorted.length - 1}>
                  <ArrowDown size={13} />
                </IconButton>
                <IconButton title="Edit image" onClick={() => openEdit(img)}>
                  <Pencil size={13} />
                </IconButton>
                <IconButton title="Delete image" danger onClick={() => setToDelete(img)}>
                  <Trash2 size={13} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <EntityFormDrawer
        open={drawer !== null}
        title={drawer?.row ? "Edit Image" : "Add Image"}
        onClose={() => setDrawer(null)}
        onSubmit={onSubmit}
        submitting={create.isPending || update.isPending}
      >
        <Fields form={form} />
      </EntityFormDrawer>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete image?"
        message="This will permanently remove the image from the gallery."
        loading={remove.isPending}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await remove.mutateAsync(toDelete.id);
          } finally {
            setToDelete(null);
          }
        }}
        onClose={() => setToDelete(null)}
      />

      <Lightbox
        images={sorted.map((g) => g.src)}
        index={preview}
        onChange={setPreview}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
