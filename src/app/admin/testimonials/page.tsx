"use client";

import type { UseFormReturn } from "react-hook-form";
import { Star } from "lucide-react";
import ResourceCrud from "@/components/admin/ResourceCrud";
import { IconButton } from "@/components/admin/ui";
import {
  TextField,
  TextareaField,
  SelectField,
  CheckField,
  FieldGrid,
} from "@/components/admin/form/fields";
import { MediaPickerField } from "@/components/admin/form/MediaPickerField";
import { adminApi } from "@/lib/admin/api";
import { useCrudMutations } from "@/lib/admin/hooks";
import { testimonialSchema, type TestimonialInput } from "@/lib/admin/schemas";
import type { AdminTestimonial } from "@/lib/admin/types";

function Stars({ rating }: { rating?: number }) {
  if (!rating) return <span className="text-muted">—</span>;
  return (
    <span className="flex gap-0.5 text-gold">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} size={13} fill="currentColor" />
      ))}
    </span>
  );
}

function Fields({ form }: { form: UseFormReturn<TestimonialInput> }) {
  const { register, control, formState: { errors } } = form;
  return (
    <>
      <TextareaField label="Quote" rows={4} error={errors.quote?.message} {...register("quote")} />
      <FieldGrid>
        <TextField label="Customer name" error={errors.name?.message} {...register("name")} />
        <TextField label="Role / Residence" error={errors.role?.message} {...register("role")} />
      </FieldGrid>
      <FieldGrid>
        <TextField label="Project (optional)" error={errors.project?.message} {...register("project")} />
        <SelectField
          label="Rating"
          placeholder="No rating"
          options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? "s" : ""}` }))}
          error={errors.rating?.message}
          {...register("rating")}
        />
      </FieldGrid>
      <MediaPickerField control={control} name="avatar" label="Customer photo (optional)" />
      <CheckField label="Featured testimonial" {...register("featured")} />
    </>
  );
}

export default function TestimonialsPage() {
  const { update } = useCrudMutations("testimonials", adminApi.testimonials, "Testimonial");

  return (
    <ResourceCrud<AdminTestimonial, TestimonialInput>
      resource="testimonials"
      singular="Testimonial"
      api={adminApi.testimonials}
      schema={testimonialSchema}
      searchText={(t) => `${t.name} ${t.role} ${t.quote}`}
      searchPlaceholder="Search testimonials…"
      columns={[
        { key: "name", header: "Customer", render: (t) => <span className="font-medium text-ink">{t.name}</span> },
        {
          key: "quote",
          header: "Quote",
          render: (t) => <span className="line-clamp-1 max-w-sm text-muted">{t.quote}</span>,
        },
        { key: "role", header: "Role", render: (t) => <span className="text-muted">{t.role}</span> },
        { key: "rating", header: "Rating", className: "w-24", render: (t) => <Stars rating={t.rating} /> },
      ]}
      extraActions={(t) => (
        <IconButton
          title={t.featured ? "Remove from featured" : "Mark as featured"}
          onClick={() => update.mutate({ id: t.id, data: { featured: !t.featured } })}
          className={t.featured ? "border-gold text-gold" : ""}
        >
          <Star size={14} fill={t.featured ? "currentColor" : "none"} />
        </IconButton>
      )}
      defaults={() => ({
        quote: "",
        name: "",
        role: "",
        project: "",
        rating: undefined,
        avatar: "",
        featured: false,
      })}
      toFormValues={(t) => ({
        quote: t.quote,
        name: t.name,
        role: t.role,
        project: t.project ?? "",
        rating: t.rating,
        avatar: t.avatar ?? "",
        featured: t.featured,
      })}
      Fields={Fields}
    />
  );
}
