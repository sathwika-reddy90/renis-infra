"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { useToast } from "@/components/admin/Toast";
import { TextField, TextareaField, FieldGrid, FormSection } from "@/components/admin/form/fields";
import { MediaPickerField } from "@/components/admin/form/MediaPickerField";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import { zodResolver } from "@/lib/admin/resolver";
import { siteApi } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/hooks";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/admin/schemas";

const EMPTY: SiteSettingsInput = {
  siteName: "",
  phone: "",
  email: "",
  address: "",
  logo: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
};

export default function SettingsPage() {
  const qc = useQueryClient();
  const { push } = useToast();

  const settings = useQuery({
    queryKey: adminKeys.site,
    queryFn: ({ signal }) => siteApi.get(signal),
  });

  const form = useForm<SiteSettingsInput>({
    resolver: zodResolver<SiteSettingsInput>(siteSettingsSchema),
    defaultValues: EMPTY,
  });
  const { register, control, formState: { errors } } = form;

  // Populate the form once settings arrive (and after refetches).
  useEffect(() => {
    if (!settings.data) return;
    form.reset({
      siteName: settings.data.siteName,
      phone: settings.data.phone,
      email: settings.data.email,
      address: settings.data.address,
      logo: settings.data.logo ?? "",
      facebook: settings.data.facebook ?? "",
      instagram: settings.data.instagram ?? "",
      linkedin: settings.data.linkedin ?? "",
      youtube: settings.data.youtube ?? "",
    });
  }, [settings.data, form]);

  const save = useMutation({
    mutationFn: siteApi.update,
    onSuccess: () => {
      push("success", "Settings saved");
      qc.invalidateQueries({ queryKey: adminKeys.site });
    },
    onError: (e) => push("error", e instanceof Error ? e.message : "Failed to save settings"),
  });

  if (settings.isPending) {
    return (
      <div className="max-w-2xl space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (settings.isError) {
    return <ErrorState message="We couldn't load site settings." onRetry={() => void settings.refetch()} />;
  }

  return (
    <div className="max-w-2xl">
      <form
        onSubmit={form.handleSubmit((values) => save.mutate(values))}
        noValidate
        className="space-y-6 border border-line bg-white p-6 md:p-8"
      >
        <FormSection title="Company Information">
          <TextField label="Company name" error={errors.siteName?.message} {...register("siteName")} />
          <FieldGrid>
            <TextField label="Phone" error={errors.phone?.message} {...register("phone")} />
            <TextField label="Email" type="email" error={errors.email?.message} {...register("email")} />
          </FieldGrid>
          <TextareaField label="Address" rows={2} error={errors.address?.message} {...register("address")} />
        </FormSection>

        <FormSection title="Branding">
          <MediaPickerField control={control} name="logo" label="Site logo (optional)" />
        </FormSection>

        <FormSection title="Social Media" description="Shown in the website footer. All optional.">
          <FieldGrid>
            <TextField label="Facebook" placeholder="https://…" error={errors.facebook?.message} {...register("facebook")} />
            <TextField label="Instagram" placeholder="https://…" error={errors.instagram?.message} {...register("instagram")} />
            <TextField label="LinkedIn" placeholder="https://…" error={errors.linkedin?.message} {...register("linkedin")} />
            <TextField label="YouTube" placeholder="https://…" error={errors.youtube?.message} {...register("youtube")} />
          </FieldGrid>
        </FormSection>

        <div className="flex items-start gap-2.5 border border-line bg-cream/50 p-4 text-xs leading-relaxed text-muted">
          <Info size={14} className="mt-0.5 flex-none text-gold" />
          Favicon and homepage hero content are managed in code for now.
        </div>

        <div className="flex justify-end">
          <AdminButton type="submit" loading={save.isPending}>
            Save Settings
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
