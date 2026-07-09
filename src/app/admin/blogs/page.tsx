"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Wand2 } from "lucide-react";
import ResourceCrud from "@/components/admin/ResourceCrud";
import { FilterSelect } from "@/components/admin/DataTable";
import { Badge } from "@/components/admin/ui";
import {
  TextField,
  TextareaField,
  SelectField,
  TagsField,
  FieldGrid,
  FormSection,
} from "@/components/admin/form/fields";
import { MediaPickerField } from "@/components/admin/form/MediaPickerField";
import { adminApi } from "@/lib/admin/api";
import { useAdminList } from "@/lib/admin/hooks";
import { slugify, fmtDate } from "@/lib/admin/format";
import { blogSchema, type BlogInput } from "@/lib/admin/schemas";
import { BLOG_STATUSES, type AdminBlog, type BlogStatusValue } from "@/lib/admin/types";

const STATUS_TONE: Record<BlogStatusValue, "green" | "neutral" | "red"> = {
  PUBLISHED: "green",
  DRAFT: "neutral",
  ARCHIVED: "red",
};

function Fields({ form }: { form: UseFormReturn<BlogInput> }) {
  const { register, control, setValue, watch, formState: { errors } } = form;
  const team = useAdminList("team", adminApi.team);

  return (
    <>
      <TextField label="Title" error={errors.title?.message} {...register("title")} />
      <div className="flex items-end gap-2">
        <TextField label="Slug" error={errors.slug?.message} className="flex-1" {...register("slug")} />
        <button
          type="button"
          onClick={() => setValue("slug", slugify(watch("title")), { shouldValidate: true })}
          className="flex h-10 items-center gap-1.5 border border-line px-3 text-[0.62rem] uppercase tracking-[0.14em] text-muted transition-colors hover:border-gold hover:text-gold"
        >
          <Wand2 size={12} /> Generate
        </button>
      </div>
      <TextareaField label="Excerpt" rows={2} error={errors.excerpt?.message} {...register("excerpt")} />
      <TextareaField
        label="Content"
        rows={10}
        hint="Rich text editor coming soon — plain text / markdown for now."
        error={errors.content?.message}
        {...register("content")}
      />
      <MediaPickerField control={control} name="coverImage" label="Cover image" />
      <FieldGrid>
        <TextField label="Category" error={errors.category?.message} {...register("category")} />
        <TextField label="Read time" placeholder="6 min read" error={errors.readTime?.message} {...register("readTime")} />
      </FieldGrid>
      <TagsField control={control} name="tags" label="Tags" />
      <FieldGrid>
        <SelectField
          label="Status"
          options={BLOG_STATUSES.map((s) => ({ value: s, label: s }))}
          error={errors.status?.message}
          {...register("status")}
        />
        <TextField label="Publish date" type="date" error={errors.publishedAt?.message} {...register("publishedAt")} />
      </FieldGrid>
      <SelectField
        label="Author"
        placeholder="No author"
        options={(team.data ?? []).map((m) => ({ value: m.id, label: m.name }))}
        error={errors.authorId?.message}
        {...register("authorId")}
      />
      <FormSection title="SEO" description="Optional meta overrides for search engines.">
        <TextField label="Meta title" error={errors.metaTitle?.message} {...register("metaTitle")} />
        <TextareaField label="Meta description" rows={2} error={errors.metaDescription?.message} {...register("metaDescription")} />
        <TagsField control={control} name="keywords" label="Keywords" />
      </FormSection>
    </>
  );
}

export default function BlogsPage() {
  const team = useAdminList("team", adminApi.team);
  const [status, setStatus] = useState("");

  const authorName = (id?: string | null) => team.data?.find((m) => m.id === id)?.name ?? "—";

  return (
    <ResourceCrud<AdminBlog, BlogInput>
      resource="blogs"
      singular="Blog"
      api={adminApi.blogs}
      schema={blogSchema}
      wide
      searchText={(b) => `${b.title} ${b.category} ${b.tags.join(" ")}`}
      searchPlaceholder="Search blogs…"
      filter={status ? (b) => b.status === status : undefined}
      toolbar={
        <FilterSelect
          value={status}
          onChange={setStatus}
          allLabel="All statuses"
          options={BLOG_STATUSES.map((s) => ({ value: s, label: s }))}
        />
      }
      columns={[
        {
          key: "title",
          header: "Title",
          render: (b) => (
            <div className="max-w-sm">
              <p className="truncate font-medium text-ink">{b.title}</p>
              <p className="truncate text-xs text-muted">/{b.slug}</p>
            </div>
          ),
        },
        { key: "category", header: "Category", render: (b) => <span className="text-muted">{b.category}</span> },
        { key: "status", header: "Status", className: "w-28", render: (b) => <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge> },
        { key: "published", header: "Published", className: "w-32", render: (b) => fmtDate(b.publishedAt) },
        { key: "author", header: "Author", render: (b) => <span className="text-muted">{authorName(b.authorId)}</span> },
      ]}
      defaults={() => ({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "",
        tags: [],
        coverImage: "",
        readTime: "",
        status: "DRAFT",
        publishedAt: "",
        authorId: "",
        metaTitle: "",
        metaDescription: "",
        keywords: [],
      })}
      toFormValues={(b) => ({
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: b.content,
        category: b.category,
        tags: b.tags,
        coverImage: b.coverImage,
        readTime: b.readTime,
        status: b.status,
        publishedAt: b.publishedAt ? b.publishedAt.slice(0, 10) : "",
        authorId: b.authorId ?? "",
        metaTitle: b.metaTitle ?? "",
        metaDescription: b.metaDescription ?? "",
        keywords: b.keywords,
      })}
      Fields={Fields}
    />
  );
}
