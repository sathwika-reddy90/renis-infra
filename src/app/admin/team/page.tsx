"use client";

import type { UseFormReturn } from "react-hook-form";
import { Mail, AtSign } from "lucide-react";
import { Linkedin } from "@/components/ui/SocialIcons";
import ResourceCrud from "@/components/admin/ResourceCrud";
import { TextField, TextareaField, FieldGrid, FormSection } from "@/components/admin/form/fields";
import { MediaPickerField } from "@/components/admin/form/MediaPickerField";
import { adminApi } from "@/lib/admin/api";
import { teamSchema, type TeamInput } from "@/lib/admin/schemas";
import type { AdminTeamMember } from "@/lib/admin/types";

function Avatar({ src, name }: { src: string; name: string }) {
  return (
    <div className="h-10 w-10 overflow-hidden rounded-full bg-cream">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={name} loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}

function Fields({ form }: { form: UseFormReturn<TeamInput> }) {
  const { register, control, formState: { errors } } = form;
  return (
    <>
      <FieldGrid>
        <TextField label="Name" error={errors.name?.message} {...register("name")} />
        <TextField label="Designation" error={errors.role?.message} {...register("role")} />
      </FieldGrid>
      <MediaPickerField control={control} name="image" label="Photo" />
      <TextareaField label="Bio (optional)" error={errors.bio?.message} {...register("bio")} />
      <TextField
        label="Display order"
        type="number"
        min={0}
        error={errors.order?.message}
        {...register("order")}
      />
      <FormSection title="Social Links" description="All optional.">
        <FieldGrid>
          <TextField label="LinkedIn" placeholder="https://…" error={errors.linkedin?.message} {...register("linkedin")} />
          <TextField label="Twitter / X" placeholder="https://…" error={errors.twitter?.message} {...register("twitter")} />
        </FieldGrid>
        <TextField label="Email" type="email" error={errors.email?.message} {...register("email")} />
      </FormSection>
    </>
  );
}

export default function TeamPage() {
  return (
    <ResourceCrud<AdminTeamMember, TeamInput>
      resource="team"
      singular="Team Member"
      api={adminApi.team}
      schema={teamSchema}
      searchText={(m) => `${m.name} ${m.role}`}
      searchPlaceholder="Search team…"
      sort={(a, b) => a.order - b.order}
      columns={[
        { key: "photo", header: "Photo", className: "w-16", render: (m) => <Avatar src={m.image} name={m.name} /> },
        { key: "name", header: "Name", render: (m) => <span className="font-medium text-ink">{m.name}</span> },
        { key: "role", header: "Designation", render: (m) => <span className="text-muted">{m.role}</span> },
        { key: "order", header: "Order", className: "w-20", render: (m) => m.order },
        {
          key: "socials",
          header: "Socials",
          render: (m) => (
            <span className="flex items-center gap-2 text-muted">
              {m.linkedin && <Linkedin size={14} className="text-gold" />}
              {m.twitter && <AtSign size={14} className="text-gold" />}
              {m.email && <Mail size={14} className="text-gold" />}
              {!m.linkedin && !m.twitter && !m.email && "—"}
            </span>
          ),
        },
      ]}
      defaults={() => ({
        name: "",
        role: "",
        image: "",
        bio: "",
        linkedin: "",
        twitter: "",
        email: "",
        order: 0,
      })}
      toFormValues={(m) => ({
        name: m.name,
        role: m.role,
        image: m.image,
        bio: m.bio ?? "",
        linkedin: m.linkedin ?? "",
        twitter: m.twitter ?? "",
        email: m.email ?? "",
        order: m.order,
      })}
      Fields={Fields}
    />
  );
}
