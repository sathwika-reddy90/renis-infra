"use client";

import type { UseFormReturn } from "react-hook-form";
import { Waves, Sparkles, ConciergeBell, Trees, Building2, Dumbbell, type LucideIcon } from "lucide-react";
import ResourceCrud from "@/components/admin/ResourceCrud";
import { TextField, TextareaField, SelectField, FieldGrid } from "@/components/admin/form/fields";
import { adminApi } from "@/lib/admin/api";
import { amenitySchema, type AmenityInput } from "@/lib/admin/schemas";
import type { AdminAmenity } from "@/lib/admin/types";

// Same icon registry the public site renders from.
const ICONS: Record<string, LucideIcon> = {
  pool: Waves,
  spa: Sparkles,
  concierge: ConciergeBell,
  gardens: Trees,
  lobby: Building2,
  fitness: Dumbbell,
};

const ICON_OPTIONS = Object.keys(ICONS).map((k) => ({ value: k, label: k }));

function IconPreview({ name }: { name: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return (
    <span className="flex h-9 w-9 items-center justify-center bg-gold/10 text-gold">
      <Icon size={16} strokeWidth={1.5} />
    </span>
  );
}

function Fields({ form }: { form: UseFormReturn<AmenityInput> }) {
  const { register, watch, formState: { errors } } = form;
  return (
    <>
      <TextField label="Title" error={errors.title?.message} {...register("title")} />
      <TextareaField label="Description" error={errors.description?.message} {...register("description")} />
      <FieldGrid>
        <div className="flex items-end gap-3">
          <SelectField
            label="Icon"
            options={ICON_OPTIONS}
            placeholder="Pick an icon"
            error={errors.icon?.message}
            className="flex-1"
            {...register("icon")}
          />
          <IconPreview name={watch("icon")} />
        </div>
        <TextField label="Category (optional)" error={errors.category?.message} {...register("category")} />
      </FieldGrid>
    </>
  );
}

export default function AmenitiesPage() {
  return (
    <ResourceCrud<AdminAmenity, AmenityInput>
      resource="amenities"
      singular="Amenity"
      api={adminApi.amenities}
      schema={amenitySchema}
      searchText={(a) => `${a.title} ${a.description} ${a.category ?? ""}`}
      searchPlaceholder="Search amenities…"
      columns={[
        { key: "icon", header: "Icon", className: "w-14", render: (a) => <IconPreview name={a.icon} /> },
        { key: "title", header: "Title", render: (a) => <span className="font-medium text-ink">{a.title}</span> },
        {
          key: "description",
          header: "Description",
          render: (a) => <span className="line-clamp-1 max-w-md text-muted">{a.description}</span>,
        },
        { key: "category", header: "Category", render: (a) => a.category ?? "—" },
      ]}
      defaults={() => ({ title: "", description: "", icon: "", category: "" })}
      toFormValues={(a) => ({
        title: a.title,
        description: a.description,
        icon: a.icon,
        category: a.category ?? "",
      })}
      Fields={Fields}
    />
  );
}
