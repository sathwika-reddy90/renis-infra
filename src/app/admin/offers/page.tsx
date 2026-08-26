"use client";

import type { UseFormReturn } from "react-hook-form";
import { Power } from "lucide-react";
import ResourceCrud from "@/components/admin/ResourceCrud";
import { IconButton, Badge } from "@/components/admin/ui";
import { TextField, TextareaField, CheckField, FieldGrid } from "@/components/admin/form/fields";
import { MediaPickerField } from "@/components/admin/form/MediaPickerField";
import { adminApi } from "@/lib/admin/api";
import { useCrudMutations } from "@/lib/admin/hooks";
import { fmtDate } from "@/lib/admin/format";
import { offerSchema, type OfferInput } from "@/lib/admin/schemas";
import type { AdminOffer, OfferStatusValue } from "@/lib/admin/types";

const STATUS_TONE: Record<OfferStatusValue, "green" | "blue" | "red" | "neutral"> = {
  ACTIVE: "green",
  SCHEDULED: "blue",
  EXPIRED: "red",
  DISABLED: "neutral",
};

function Fields({ form }: { form: UseFormReturn<OfferInput> }) {
  const { register, control, formState: { errors } } = form;
  return (
    <>
      <TextField label="Offer title" error={errors.title?.message} {...register("title")} />
      <TextareaField label="Description" rows={3} error={errors.description?.message} {...register("description")} />
      <TextField label="Discount / value" placeholder="20% OFF" error={errors.discount?.message} {...register("discount")} />
      <MediaPickerField control={control} name="image" label="Offer image (optional)" />
      <FieldGrid>
        <TextField label="Start date" type="date" error={errors.startDate?.message} {...register("startDate")} />
        <TextField label="End date" type="date" error={errors.endDate?.message} {...register("endDate")} />
      </FieldGrid>
      <FieldGrid>
        <TextField label="CTA text (optional)" error={errors.ctaText?.message} {...register("ctaText")} />
        <TextField label="CTA link (optional)" error={errors.ctaLink?.message} {...register("ctaLink")} />
      </FieldGrid>
      <TextField
        label="Display priority"
        type="number"
        min={0}
        hint="Lower numbers show first"
        error={errors.priority?.message}
        {...register("priority")}
      />
      <CheckField label="Enabled" {...register("enabled")} />
    </>
  );
}

export default function OffersPage() {
  const { update } = useCrudMutations("offers", adminApi.offers, "Offer");

  return (
    <ResourceCrud<AdminOffer, OfferInput>
      resource="offers"
      singular="Offer"
      api={adminApi.offers}
      schema={offerSchema}
      searchText={(o) => `${o.title} ${o.description} ${o.discount}`}
      searchPlaceholder="Search offers…"
      sort={(a, b) => a.priority - b.priority}
      columns={[
        {
          key: "title",
          header: "Offer",
          render: (o) => <span className="line-clamp-1 max-w-sm font-medium text-ink">{o.title}</span>,
        },
        { key: "discount", header: "Discount", render: (o) => <span className="text-muted">{o.discount}</span> },
        { key: "startDate", header: "Start", className: "w-28", render: (o) => fmtDate(o.startDate) },
        { key: "endDate", header: "End", className: "w-28", render: (o) => fmtDate(o.endDate) },
        {
          key: "status",
          header: "Status",
          className: "w-28",
          render: (o) => <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>,
        },
      ]}
      extraActions={(o) => (
        <IconButton
          title={o.enabled ? "Disable offer" : "Enable offer"}
          onClick={() => update.mutate({ id: o.id, data: { enabled: !o.enabled } })}
          className={o.enabled ? "border-gold text-gold" : ""}
        >
          <Power size={14} />
        </IconButton>
      )}
      defaults={() => ({
        title: "",
        description: "",
        discount: "",
        image: "",
        startDate: "",
        endDate: "",
        ctaText: "",
        ctaLink: "",
        priority: 0,
        enabled: true,
      })}
      toFormValues={(o) => ({
        title: o.title,
        description: o.description,
        discount: o.discount,
        image: o.image ?? "",
        startDate: o.startDate ? o.startDate.slice(0, 10) : "",
        endDate: o.endDate ? o.endDate.slice(0, 10) : "",
        ctaText: o.ctaText ?? "",
        ctaLink: o.ctaLink ?? "",
        priority: o.priority,
        enabled: o.enabled,
      })}
      Fields={Fields}
    />
  );
}
