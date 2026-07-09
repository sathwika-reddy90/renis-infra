"use client";

import { useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import ResourceCrud from "@/components/admin/ResourceCrud";
import { FilterSelect } from "@/components/admin/DataTable";
import { Badge } from "@/components/admin/ui";
import { TextField, TextareaField, FieldGrid } from "@/components/admin/form/fields";
import { adminApi } from "@/lib/admin/api";
import { useAdminList } from "@/lib/admin/hooks";
import { faqSchema, type FaqInput } from "@/lib/admin/schemas";
import type { AdminFaq } from "@/lib/admin/types";

function Fields({ form }: { form: UseFormReturn<FaqInput> }) {
  const { register, formState: { errors } } = form;
  return (
    <>
      <TextField label="Question" error={errors.question?.message} {...register("question")} />
      <TextareaField label="Answer" rows={5} error={errors.answer?.message} {...register("answer")} />
      <FieldGrid>
        <TextField
          label="Group / Category"
          hint="FAQs are grouped by this on the site"
          error={errors.category?.message}
          {...register("category")}
        />
        <TextField label="Order within group" type="number" min={0} error={errors.order?.message} {...register("order")} />
      </FieldGrid>
    </>
  );
}

export default function FaqsPage() {
  const list = useAdminList("faqs", adminApi.faqs);
  const [category, setCategory] = useState("");

  const categories = useMemo(
    () => [...new Set((list.data ?? []).map((f) => f.category))].sort(),
    [list.data],
  );

  return (
    <ResourceCrud<AdminFaq, FaqInput>
      resource="faqs"
      singular="FAQ"
      api={adminApi.faqs}
      schema={faqSchema}
      searchText={(f) => `${f.question} ${f.answer} ${f.category}`}
      searchPlaceholder="Search FAQs…"
      filter={category ? (f) => f.category === category : undefined}
      sort={(a, b) => a.category.localeCompare(b.category) || a.order - b.order}
      toolbar={
        <FilterSelect
          value={category}
          onChange={setCategory}
          allLabel="All groups"
          options={categories.map((c) => ({ value: c, label: c }))}
        />
      }
      columns={[
        {
          key: "question",
          header: "Question",
          render: (f) => <span className="line-clamp-1 max-w-md font-medium text-ink">{f.question}</span>,
        },
        { key: "category", header: "Group", render: (f) => <Badge tone="gold">{f.category}</Badge> },
        { key: "order", header: "Order", className: "w-20", render: (f) => f.order },
        {
          key: "answer",
          header: "Answer",
          render: (f) => <span className="line-clamp-1 max-w-sm text-muted">{f.answer}</span>,
        },
      ]}
      defaults={() => ({ question: "", answer: "", category: "", order: 0 })}
      toFormValues={(f) => ({
        question: f.question,
        answer: f.answer,
        category: f.category,
        order: f.order,
      })}
      Fields={Fields}
    />
  );
}
